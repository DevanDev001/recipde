# Recipde
Recipde is a decentralized app that allows users to create recipes, with a title, an image, the country of origin of the dish, and its preparation. It also allows other users to see these recipes, only the title, the image and the origin, so that they can buy it, and it unlocks for the buyer, allowing him to see it later, in addition to set aside in a different section that shows only the purchased recipes, once purchased you can see it whenever you want, showing its complete preparation, and also like it.

## Demo
page: https://devandev001.github.io/recipde/

## Contract Functions

### addRecipe
Adds a recipe to the feed, allowing any user to see it

### getRecipe
Returns the information of a recipe by his index

### getRecipesLength
Returns the length of the totaal recipes

### getUnlockedRecipes
Returns an array of integers with the indexes of the unlocked recipes

### likeRecipe
Adds one like to the recipe post by the index

### unlockRecipe
Transacts the price of the recipe from the buyer to the owner by the recipe index, also, adds that index to the array of unlocked recipes, letting the user to see it in the future

# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
