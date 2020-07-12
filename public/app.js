async function submitAction() {
    console.log('submit');

    const url = 'https://slugit.herokuapp.com/url';
    const formData = new FormData(formElem);
    const data = {
        "url": formData.get('url'),
        "slug": formData.get('slug')
    }

    console.log(JSON.stringify(data));
    const header = {
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        method: "POST"
    };

    let response =await fetch(url,header);

    if(response.ok) {
        let json = await response.json();
        let msg = document.getElementById('message');
        msg.innerHTML = 'URL created: ' + window.location.href + 'url/' + json.slug;
    } 
    else {
        var msg = document.getElementById('message');
        msg.innerHTML = "Request failed";
        msg.style.color = 'red'; 
    }
}