import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"

const ERC20_DECIMALS = 18
const MPContractAddress = "0x6E06db30959C54fCeFF7c1c0a029C269F2C7835c"
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"

let kit
let contract
let recipes = []
let unlocked = []

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  const result = await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })

  return result
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}

const getProducts = async function() {
  const _productsLength = await contract.methods.getRecipesLength().call()
  unlocked = await contract.methods.getUnlockedRecipes(kit.defaultAccount).call()
  const _recipes = []
  for (let i = 0; i < _productsLength; i++) {
    let _product = new Promise(async (resolve, reject) => {
      let p = await contract.methods.getRecipe(i).call()
      resolve({
        index: i,
        owner: p[0],
        title: p[1],
        image: p[2],
        description: p[3],
        origin: p[4],
        price: new BigNumber(p[5]),
        likes: p[6],
      })
    })
    _recipes.push(_product)
  }
  recipes = await Promise.all(_recipes)
  renderProducts()
}

const getUnlockedProducts = async function() {
    document.getElementById("marketplace").innerHTML = ""
    unlocked = await contract.methods.getUnlockedRecipes(kit.defaultAccount).call()
    const _productsLength = await contract.methods.getRecipesLength().call()

    const _recipes = []
    for (let i = 0; i < _productsLength; i++) {
        let _product = new Promise(async (resolve, reject) => {
          let p = await contract.methods.getRecipe(i).call()
          resolve({
            index: i,
            owner: p[0],
            title: p[1],
            image: p[2],
            description: p[3],
            origin: p[4],
            price: new BigNumber(p[5]),
            likes: p[6],
          })
        })
        _recipes.push(_product)
      }
      let tmp = await Promise.all(_recipes)

      console.log(tmp);

      recipes = []

      tmp.forEach(element => {
          if(unlocked.includes(element.index.toString())) {
              recipes.push(element)
          }
      });

      console.log(recipes);

      renderProducts()


  }

function renderProducts() {
  document.getElementById("marketplace").innerHTML = ""
  recipes.forEach((_recipe) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    if (unlocked.includes(_recipe.index.toString())) {
        newDiv.innerHTML = unlockedProductTemplate(_recipe)
    }
    else{
        newDiv.innerHTML = productTemplate(_recipe)
    }
    document.getElementById("marketplace").appendChild(newDiv)
  })
}

function fillModal() {

}

function productTemplate(_recipe) {
  return `
    <div class="card mb-4">
      <img class="card-img-top" src="${_recipe.image}" alt="...">
      <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
        ${_recipe.likes} Likes
      </div>
      <div class="card-body text-left p-4 position-relative">
        <div class="translate-middle-y position-absolute top-0">
        ${identiconTemplate(_recipe.owner)}
        </div>
        <h2 class="card-title fs-4 fw-bold mt-2">${_recipe.title}</h2>
        <p class="card-text mt-4">
          <i class="bi bi-geo-alt-fill"></i>
          <span>${_recipe.origin}</span>
        </p>
        <div class="d-grid gap-2">
          <a class="btn btn-lg btn-outline-dark buyBtn fs-6 p-3" id=${
            _recipe.index
          }>
            Buy for ${_recipe.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD
          </a>
        </div>
      </div>
    </div>
  `
}

function unlockedProductTemplate(_recipe) {
    return `
      <div class="card mb-4">
        <img class="card-img-top" src="${_recipe.image}" alt="...">
        <div class="position-absolute top-0 end-0 bg-warning mt-4 px-2 py-1 rounded-start">
          ${_recipe.likes} Likes
        </div>
        <div class="card-body text-left p-4 position-relative">
          <div class="translate-middle-y position-absolute top-0">
          ${identiconTemplate(_recipe.owner)}
          </div>
          <h2 class="card-title fs-4 fw-bold mt-2">${_recipe.title}</h2>
          <p class="card-text mt-4">
            <i class="bi bi-geo-alt-fill"></i>
            <span>${_recipe.origin}</span>
          </p>
          <div class="d-grid gap-2">
                <a
                  class="btn btn-dark rounded-pill view"
                  data-bs-toggle="modal"
                  data-bs-target="#view"
                  id=${
                    _recipe.index
                  }
                >
                  View
                </a>
          </div>
        </div>
      </div>
    `
  }

function identiconTemplate(_address) {
  const icon = blockies
    .create({
      seed: _address,
      size: 8,
      scale: 16,
    })
    .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}

function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getProducts()
  notificationOff()
});

document
  .querySelector("#newProductBtn")
  .addEventListener("click", async (e) => {
    const params = [
      document.getElementById("newProductName").value,
      document.getElementById("newImgUrl").value,
      document.getElementById("newProductDescription").value,
      document.getElementById("newLocation").value,
      new BigNumber(document.getElementById("newPrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString()
    ]
    notification(`⌛ Adding "${params[0]}"...`)
    try {
      const result = await contract.methods
        .addRecipe(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added "${params[0]}".`)
    getProducts()
  })

document.querySelector("#marketplace").addEventListener("click", async (e) => {
  if (e.target.className.includes("buyBtn")) {
    const index = e.target.id
    notification("⌛ Waiting for payment approval...")
    try {
      await approve(recipes[index].price)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`⌛ Awaiting payment for "${recipes[index].title}"...`)
    try {
      const result = await contract.methods
        .unlockRecipe(index)
        .send({ from: kit.defaultAccount })
      notification(`🎉 You successfully bought "${recipes[index].title}".`)
      getProducts()
      getBalance()
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  }
  else if (e.target.className.includes("view")) {
      const index = e.target.id
      document.querySelector(".title").textContent = recipes[index].title
      document.querySelector(".image").src = recipes[index].image
      document.querySelector(".desc").textContent = recipes[index].description
      document.querySelector(".origin").textContent = recipes[index].origin
      document.querySelector(".like").id = recipes[index].index
  }
})  

document.querySelector("#all").addEventListener("click", async (e) => {
    await getProducts()
})

document.querySelector("#unlocked").addEventListener("click", async (e) => {
    await getUnlockedProducts()
})

document.querySelector(".like").addEventListener("click", async (e) => {
    notification(`⌛ Liking ...`)
    const _liked = await contract.methods.getLiked(kit.defaultAccount).call()
    if (_liked.includes(e.target.id.toString())){
      notification(`⚠️ Already Liked.`)
    }
    else {
      try {
        const result = await contract.methods
          .likeRecipe(parseInt(e.target.id))
          .send({ from: kit.defaultAccount })
      } catch (error) {
        notification(`⚠️ ${error}.`)
      }
      notification(`🎉 Liked !!!`)
      getProducts()
    }
})