const site = "https://api.mercadolibre.com";
const cartItems = document.querySelector(".cart__items");
const btnCleanCart = document.querySelector(".empty-cart");
const itemsSection = document.querySelector(".items");

const saveCart = () => {
  localStorage.setItem("shopping", cartItems.innerHTML);
};

function createProductImageElement(imageSource) {
  const img = document.createElement("img");
  img.className = "item__image";
  img.src = imageSource;
  return img;
}

function getBtnEmprtyCart() {
  cartItems.innerHTML = "";
  document.getElementById("tprice").innerText = 0;
  saveCart();
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

const getTotalPrice = (price, operation) => {
  const totalPrice = document.querySelector(".total-price");
  let total = 0;
  if (totalPrice.innerText) total = Number(totalPrice.innerText);
  if (operation === "sum") total += Number(price);
  if (operation === "sub") total -= Number(price);
  totalPrice.innerText = total > 0 ? Number(total).toFixed(2) : 0;
  localStorage.setItem("total", Number(total));
};

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement("section");
  section.className = "item";

  section.appendChild(createCustomElement("span", "item__sku", sku));
  section.appendChild(createCustomElement("span", "item__title", name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(
    createCustomElement("button", "item__add", "Adicionar ao carrinho!")
  );
  itemsSection.appendChild(section);
  return section;
}

// function getSkuFromProductItem(item) {
//   return item.querySelector('span.item__sku').innerText;
// }

function cartItemClickListener(event) {
  event.target.closest("li").remove();
  saveCart();
  const li = event.target.closest("li").children[0].children[1];
  getTotalPrice(li.innerText.split("PRICE: $").pop(), "sub");
}

function createCartItemElement({ sku, name, salePrice, thumbnail }) {
  const li = document.createElement("li"),
    img = document.createElement("img"),
    div = document.createElement("div"),
    p = document.createElement("p");

  li.className = "cart__item bg-gray-300 m-3 rounded";
  div.className = "div__cart-item";
  img.className = "cart__img";
  p.className = "cart-p";
  img.src = thumbnail;
  p.innerText = `${name} | PRICE: $${salePrice}`;
  div.appendChild(img);
  div.appendChild(p);
  li.appendChild(div);
  return li;
}

function receiveDataItem(item, thumbnail) {
  const itemData = createCartItemElement({
    sku: item.id,
    name: item.title,
    salePrice: item.price,
    thumbnail,
  });
  getTotalPrice(item.price, "sum");
  cartItems.appendChild(itemData);
  saveCart();
}

const addCart = (event) => {
  const itemId = event.target.parentNode.firstChild.innerText;

  fetch(`${site}/items/${itemId}`)
    .then((response) => response.json())
    .then(async (dataItem) => {
      const responseThumbnail = await fetch(
        `https://api.mercadolibre.com/items/${itemId}`
      );
      const { pictures } = await responseThumbnail.json();
      receiveDataItem(dataItem, pictures[0].url);
    });
};

const addSectionProduct = (product, thumbnail) => {
  const productData = createProductItemElement({
    sku: product.id,
    name: product.title,
    image: thumbnail,
  });
  itemsSection.appendChild(productData);

  const btnsAddToCard = document.querySelectorAll(".item__add");
  btnsAddToCard.forEach((btn) => btn.addEventListener("click", addCart));
};

const fetchProduct = async () =>
  fetch(`${site}/sites/MLB/search?q=computador`)
    .then((answer) => answer.json())
    .then((productData) => {
      productData.results.forEach(async (result) => {
        const responseThumbnail = await fetch(
          `https://api.mercadolibre.com/items/${result.id}`
        );
        const { pictures } = await responseThumbnail.json();
        addSectionProduct(result, pictures[0].url);
      });
    });

/*===================== SEARCH ======================*/
const searchBtn = document.getElementById("search__button");

function getSearchValue() {
  return document.getElementById("search__input").value;
}

function getNewSearch(event) {
  const divMainContent = document.getElementById("main__content");

  event.preventDefault();
  Array.from(divMainContent.children).forEach((item) => item.remove());
  document.querySelector(".loading").classList.remove("display__none");
  fetch(`${site}/sites/MLB/search?q=${getSearchValue()}`)
    .then((answer) => answer.json())
    .then((productData) => {
      productData.results.forEach(async (result) => {
        const responseThumbnail = await fetch(
          `https://api.mercadolibre.com/items/${result.id}`
        );
        const { pictures } = await responseThumbnail.json();
        addSectionProduct(result, pictures[0].url);
      });
    })
    .then(() => {
      document.querySelector(".loading").classList.add("display__none");
    });
}

searchBtn.addEventListener("click", (event) => getNewSearch(event));
/*===================================================*/

/*==================== NAV MOBILE ====================*/
const header = document.getElementById("header-mobile"),
  navCart = document.getElementById("nav-cart"),
  navClose = document.getElementById("nav-close");

if (navCart) {
  navCart.addEventListener("click", () => {
    header.classList.add("show-menu");
  });
}

if (navClose) {
  navClose.addEventListener("click", () => {
    header.classList.remove("show-menu");
  });
}
/*========================================*/

window.onload = () => {
  fetchProduct().then(() => {
    document.querySelector(".loading").classList.add("display__none");
    document.querySelector("#main__content").classList.remove("display__none");
  });
  btnCleanCart.addEventListener("click", getBtnEmprtyCart);
  cartItems.innerHTML = localStorage.getItem("shopping");
  cartItems.addEventListener("click", cartItemClickListener);
};
