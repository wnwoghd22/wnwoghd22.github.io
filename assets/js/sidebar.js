var current_category = "";
var page_length = 10;
var index = 0;

setIndexByElement = n => {
    index = n;

    console.log('postpage' + ' ' + current_category);

    let items = document.getElementsByClassName('post-item' + ' ' + current_category);

    let page_num = Math.ceil(items.length / page_length);

    Array.from(items).forEach(element => {
        element.style.display = 'none';
    });

    for(let i = n * page_length; i < Math.min((n + 1) * page_length, items.length); ++i) {
        items[i].style.display = 'block';
    }

    let postion = document.getElementById('indexer');
    postion.innerText= String(index+1) + "/" + String(page_num);
}

SetCategory = c => {
    current_category = c;

    index = 0;
    let items = document.getElementsByClassName('post-item');
    Array.from(items).forEach(element => {
        element.style.display = 'none';
    });

    setIndexByElement(0);
}