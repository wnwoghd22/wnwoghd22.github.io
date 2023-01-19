var params = {};
var current_category = "";
var page_length = 10;
var index = 0;
var all_items;
var items;
var page_num; 

init = () => {
    items = document.getElementsByClassName('post-item' + ' ' + current_category);
    console.log(items)
    console.log(items.length)
    page_num = Math.ceil(items.length / page_length);
}

setIndexByElement = n => {
    index = n;

    console.log('postpage' + ' ' + current_category);

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
    all_items = document.getElementsByClassName('post-item');
    Array.from(all_items).forEach(element => {
        element.style.display = 'none';
    });
}

previousPage = () => {
    if(index > 0) setIndexByElement(--index);
}
nextPage = () => {
    if(index < page_num - 1) setIndexByElement(++index);
}

GetParams = () => {
    let url = location.href;
    temp_split = url.split('?');

    if (temp_split.length < 2) return;

    temp_params = temp_split[1].split('&');

    temp_params.forEach(element => {
        let temp = element.split('=');
        params[temp[0]] = temp[1];
    });
}

GetParams();

if('category' in params)
    SetCategory(params['category']);
init();
setIndexByElement(0);