var params = {};

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
setIndexByElement(0);