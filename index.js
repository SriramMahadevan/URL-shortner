const express = require('express');
const morgan = require('morgan');
const helmet = require ('helmet');
const yup = require('yup');
const nanoid = require('nanoid');
const cors = require('cors');
const monk = require('monk');

require('dotenv').config();

const db = monk(process.env.MONGODB_URI);
const urls = db.get('urls');
urls.createIndex('name');

const app= express();

app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.static('./public'));

const schema = yup.object().shape({
    slug: yup.string().trim().matches(/[\w\-]/i),
    url: yup.string().trim().url().required()
})

app.get('/:id',(req,res) => {
    res.json({
        message: req.id
    });
});

app.get('/url/:id',async (req,res) => {
    const {id:slug} = req.params;
    try {
        console.log(slug);
        const url = await urls.findOne({slug});
        console.log(url);
        if(url) {
            res.redirect(url.url);
        } 
        res.redirect(`/error=${slug} not found`);
    } catch(error) {
        res.redirect(`/error=Link not found`);
    }
});

app.post('/url',async (req,res,next) => {
   var slug = req.body.slug;
   var url = req.body.url;
   console.log(url);
   try {
       await schema.validate({
           slug,
           url
       });
       if (!slug) {
           slug = nanoid(5);
       } else {
           const existing = await urls.findOne({slug});
           if(existing) {
               throw new Error('Slug in use');
           }
       }
       slug = slug.toLowerCase();
       const newUrl = {
           url,
           slug
       };
       const created = await urls.insert(newUrl);
       res.json(created);
   } catch (error) {
            next(error);
        }
});

app.use((error,req,res,next) => {
    if(error.status) {
        res.status(error.status);
    } else {
        res.status(500);
    }
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV ==='production'? 'prod' : error.stack
    })
});

const port = process.env.PORT || 1337;
app.listen(port, () => {
    console.log(`Listening at hhtp://localhost:${port}`)
});