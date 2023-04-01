const NewsList = async (data) => { // newsList 생성
    const newsListContainer = document.createElement('div');
    newsListContainer.className = 'news-list-container';

    const newsListArticle = document.createElement('article');
    newsListArticle.className = 'news-list';
    newsListArticle.dataset.category = data.category;
    newsListContainer.appendChild(newsListArticle);

    const newsList = await getNewsList(data);
    newsList.forEach((item) => {
        newsListArticle.appendChild(item);
    });

    const scrollObserverElement = observerElement();

    newsListContainer.appendChild(scrollObserverElement);

    scrollObserver(newsListArticle, scrollObserverElement);


    return newsListContainer;
};


const getNewsList = async (page = 1, category) => { // api 호출
    const newsArr = [];
    const apiKey = '65f2e394870e45b9a5d51f4d095ed288';
    // page를 1 증가시키면 다음 페이지의 뉴스를 취득한다.
    const url = `https://newsapi.org/v2/top-headlines?country=kr&category=${category === 'all' ? '' : category}&page=${page}&pageSize=8&apiKey=${apiKey}`;

    try {
        const response = await axios.get(url);
        const articles = response.data.articles;


        articles.forEach((data) => {
            if (data.urlToImage === null) {
                data.urlToImage = 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==';
            }

            if (data.description === null) {
                data.description = '내용이 없습니다.';
            }


            const newsItem = document.createElement('section'); // section 생성
            newsItem.className = 'news-item';
            newsItem.insertAdjacentHTML('beforeend', `
                <div class="thumbnail">
                    <a href=${data.url} target="_blank" 
                    rel="noopener noreferrer">
                        <img
                        src=${data.urlToImage}
                        alt="thumbnail" />
                    </a>
                </div>
                <div class="contents">
                    <h2>
                        <a href=${data.url} target="_blank" 
                        rel="noopener noreferrer">
                        ${data.title}
                        </a>
                    </h2>
                    <p>
                    ${data.description}
                    </p>
                </div>
            `);
            newsArr.push(newsItem);
        });
        return newsArr;
    } catch (error) {
        console.log(error);
    }
};


const observerElement = () => {
    const observerElement = document.createElement('div');
    observerElement.className = 'scroll-observer';
    observerElement.dataset.page = '1';

    const observerImg = document.createElement('img');
    observerImg.src = './img/ball-triangle.svg';
    observerImg.alt = 'Loading...';

    observerElement.appendChild(observerImg);

    return observerElement;
};


const scrollObserver = (newsListArticle, scrollObserverElement) => {
    const callback = async (entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                const nextPage = parseInt(entry.target.dataset['page']);
                const category = newsListArticle.dataset.category;

                const newsList = await getNewsList(nextPage, category);
                entry.target.dataset['page'] = nextPage + 1;

                if (newsList.length > 0) {
                    newsList.forEach((data) => {
                        newsListArticle.appendChild(data);
                    });
                    continue;
                }
                observer.unobserve(entry.target);
                entry.target.remove();
            }
        }
    };
    const observer = new IntersectionObserver(callback, {threshold: 1.0});
    observer.observe(scrollObserverElement);
};


export default NewsList;
