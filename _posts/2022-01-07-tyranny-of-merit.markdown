---
layout: book
title:  "공정하다는 착각 ~ 능력주의의 폭정"
date:   2022-01-07 18:00:00 +0900
categories: book
book-title: "공정하다는 착각"
book-author: 마이클 샌델
pub-date: 2020.12.01.
book-img: /assets/images/2022-01-07-tyranny-of-merit/cover.jpg
---

이어서 사이드바를 만들어 봅시다.

일단 `sticky` 속성을 부여하겠습니다.
이 속성이 부여되면, 스크롤을 내려도 요소가 화면 밖으로 튀어나가는 것을 막을 수 있습니다.

{% highlight ruby %}{% raw %}
.sidebar {
  float: left;
  position: sticky;
  height: auto;
  top: 0;
}
{% endraw %}{% endhighlight %}
(`sticky`가 제대로 작동하려면 `top`을 지정해 주어야 합니다.)

![scroll](/assets/images/2022-01-06-side-bar-2/scroll.png)
![scroll(2)](/assets/images/2022-01-06-side-bar-2/scroll_down.png)

요소가 마치 화면 끝에 착 붙은(stick) 것처럼 됩니다. 그래서 속성의 이름 또한 `sticky`죠.

이제 버튼의 기능을 만들어봅시다.
링크를 클릭하면, 별도의 `category` 페이지로 넘어가게 만드는 것은 어떨까? 하고 생각해봤지만, 이 방법을 쓰기 위해서는 각 카테고리마다 별도의 `category_[name].html` 파일을 만들고 `Front Matter`에 `category` 변수를 정의해 주어야 하고, 또... 이래서는 끝이 없겠습니다.

조금 욕심을 부려서, `JavaScript`로 상호작용을 구현해보죠.

우선 홈페이지의 리스트를 컴포넌트로 만들어서 `_layouts\homeList`의 파일들로 분리하겠습니다.
그리고, JS의 함수에서 리스트를 참조할 수 있게, 카테고리 별로 클래스를 지정해줍니다.

{% highlight ruby %}{% raw %}
<!-- _layouts/homeList/element.html -->

{% capture post_class %}post-item {{ post.categories | first }}{% endcapture %}
  <li class="{{ post_class }}">

  [...]
{% endraw %}{% endhighlight %}

`liquid`는 다양한 변수 할당 방식을 통해 값을 줄 수 있습니다.
가장 단순한 예로는 `assign`이 있죠. 그냥 보통의 할당(`=`) 연산자처럼 쓰면 됩니다.
`capture`는 좀 특이한데, 위 코드의 맨 윗줄처럼 `capture [var]`과 `endcapture`사이에 쓰인 문자열을 통째로 변수에 할당합니다. 위 문장이 변환되면, `post_class` 변수에는 `post_item`과 `category` 두 개가 들어가게 됩니다. 그리고 HTML `class`에는 복수의 클래스 지정이 가능하죠.

![class](/assets/images/2022-01-06-side-bar-2/assign_class.png)

클래스를 지정했으면 이제 함수를 만들어봅시다.

함수는 어디에 선언해야 할까요? `.js` 파일을 만들어서 끌어다 넣을 수 있다면야 더할 나위 없이 좋겠지만, `assets` 폴더에 넣는 건 나중에 하고, 우선 기능이나 만들어 봅시다.
`{% raw %}<script>{% endraw %}` 태그 안에는 JS 문법을 이용해 페이지의 어떤 기능이라도 만들어낼 수 있습니다. 임의의 태그를 추가하거나, 반대로 지우는 것도 가능하죠. 이번에는 리스트의 각 원소를 조건에 따라 화면에 출력하도록 하는 간단한 기능만 쓸 겁니다.

HTML 과 JS 는 스크립트언어로, 위에서부터 아래로 내려오며 각 문장을 `인터프리팅`합니다. `C`나 `JAVA`처럼 시작부터 끝까지 완성된 코드를 미리 `컴파일`하는 구조가 아니어서, 코드를 한 줄 한 줄 수정해 가며 결과를 눈으로 확인할 수 있다는 장점이 있습니다. 하지만 그만큼 실행 중 오류가 발생하지 않도록 주의를 기울여야 합니다. 위에서 변수가 선언되어 있지 않으면, 변수를 참조해도 `undefined`를 뱉어냅니다. 물론 `호이스팅`같은 장치가 존재하지만, 중요한 것들은 상단에 정의해 두는 게 좋겠습니다.

{% highlight ruby %}{% raw %}
var current_category = "";
var page_length = 10;
var index = 0;

setIndexByElement = n => {
  index = n;

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
{% endraw %}{% endhighlight %}

일단 필요한 변수들을 위에 정의해줬습니다.

`current_category` : 현재 카테고리. 사이드바의 카테고리를 클릭하면 이 변수에 카테고리 이름이 할당됩니다.

`page_length` : 한 페이지에 몇 개까지 요소를 보여줄지를 지정하는 변수입니다. 나중에 `{% raw %}<input>{% endraw %}`<input type='number' style='width:30px'>을 이용하여 좀 더 유동적인 리스트를 만들어보죠.

`index` : 현재 페이지. default는 0이고, 화면을 넘김에 따라 증감시킬 겁니다.

기능 구현을 위한 함수도 만들어봅시다.
(`JS`는 패러미터에 자료형을 명시하지 않습니다. 이 글에서는 편의를 위해 썼습니다.)

`setIndexByElement(n: number)` : n번째 페이지를 표시합니다. 동시에 index 변수도 수정합니다.

{% highlight ruby %}{% raw %}
let items = document.getElementsByClassName('post-item' + ' ' + current_category);
{% endraw %}{% endhighlight %}

지정된 클래스에 따라 리스트 아이템을 찾습니다. `document.getElementsByClassName` 함수를 이용하면 둘 이상의 클래스가 지정된 태그를 찾는 것도 가능합니다. 카테고리를 지정해주면, `post-item`이면서 동시에 `[current_category]`인 태그만 반환값에 들어가게 됩니다.

`SetCategory(category : string)` : 카테고리를 지정합니다. 빈 문자열을 넘기면 클래스가 지정되지 않으면서 동시에 모든 `post-item`이 배열 안에 들어가게 됩니다.

설명이 좀 빈약한 듯 하지만, 일단 결과를 봅시다.

![class](/assets/images/2022-01-06-side-bar-2/category_jekyll.png)
![class](/assets/images/2022-01-06-side-bar-2/category_daily.png)

음, 이만하면 소기의 성과는 달성한 셈이네요.

하지만 아직 해결해야 할 문제가 있습니다.

![class](/assets/images/2022-01-06-side-bar-2/error.png)

홈페이지가 아닌 화면에서 사이드바를 클릭해도, JS는 여전히 리스트 원소에 접근을 시도합니다. 하지만 화면에는 그게 없는걸요. 이건 링크를 넘겨서 해결해 주어야 할 것 같네요.

일단 오늘은 여기까지 하겠습니다.