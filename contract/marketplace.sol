// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Base {
    uint256 internal recipesLength = 0;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct Recipe {
        address payable owner;
        string title;
        string image;
        string description;
        string origin;
        uint256 price;
        uint256 likes;
    }

    mapping(address => uint256[]) internal unlockedRecipes;

    mapping(uint256 => Recipe) internal recipes;

    mapping(address => uint256[]) internal liked;

    function addRecipe(
        string memory _title,
        string memory _image,
        string memory _description,
        string memory _origin,
        uint256 _price
    ) public {
        uint256 _likes = 0;
        recipes[recipesLength] = Recipe(
            payable(msg.sender),
            _title,
            _image,
            _description,
            _origin,
            _price,
            _likes
        );
        recipesLength++;
    }

    function getRecipe(uint256 _index)
        public
        view
        returns (
            address payable,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256
        )
    {
        return (
            recipes[_index].owner,
            recipes[_index].title,
            recipes[_index].image,
            recipes[_index].description,
            recipes[_index].origin,
            recipes[_index].price,
            recipes[_index].likes
        );
    }

    function likeRecipe(uint256 _index) public {
        recipes[_index].likes++;
        liked[msg.sender].push(_index);
    }

    function unlockRecipe(uint256 _index) public payable {
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                recipes[_index].owner,
                recipes[_index].price
            ),
            "Transfer failed."
        );
        unlockedRecipes[msg.sender].push(_index);
    }

    function getRecipesLength() public view returns (uint256) {
        return (recipesLength);
    }

    function getUnlockedRecipes(address _profile)
        public
        view
        returns (uint256[] memory)
    {
        return (unlockedRecipes[_profile]);
    }

    function getLiked(address _profile) public view returns (uint256[] memory) {
        return (liked[_profile]);
    }
}
