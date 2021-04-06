pragma solidity ^0.5.0;

contract Marketplace {
    string public name; // this is state var, written on blockchain

    uint public productCount = 0;
    // use to count how many products are in mapping

    // hash table, associative table, keys and values
    //public allows you to reference products outside this 
    // we use mapping to read / write to the blockchain
    mapping(uint => Product) public products;

    // create own data structure
    struct Product {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event ProductCreated (
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );


    event ProductPurchased (
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    // constructor run once, when smart contract deployed
    constructor() public {
        name = "Creator Marketplace";
    }

    function createProduct(string memory _name, uint _price) public {
        // make sure product parameters are correct
        
        // require name
        require(bytes(_name).length > 0); // if true, continue, if false, stop

        // require valid price
        require(_price > 0);

        // Increment product count

        productCount ++;

        // Create the product
        products[productCount] = Product(productCount, _name, _price, msg.sender, false);
        //msg.sender = solidity method, value of eth address of person who called function

        // Trigger event, telling blockchain something happened
        emit ProductCreated(productCount, _name, _price, msg.sender, false);
        
    }

    function purchaseProduct(uint _id) public payable { // payable allows for value method, payment
        // fetch product
        Product memory _product = products[_id]; //instantiating a new Product, assigning it to local product variable, fetch that particular product out of products mapping and create copy in memory 
        
        // fetch owner
        address payable _seller = _product.owner; // payable allows for ETH transfer, need to add before every instance of seller 

        // make sure product is valid ie can be purchased
        // make sure product has valid id
        require(_product.id > 0 && _product.id <= productCount);

        // require enough ether in transaction
        require(msg.value >= _product.price); 

        // require product hasn't been already purchased
        require(!_product.purchased);

        // require buyer is not seller 
        require(_seller != msg.sender);

        // purchase it
        // transfer ownership to buyer
        _product.owner = msg.sender;

        // mark as purchased
        _product.purchased = true;

        //update product in mapping
        products[_id] = _product;
        
        //pay the seller by sending them Ether
        address(_seller).transfer(msg.value); // pays seller with ether that came in


        // trigger an event
        emit ProductPurchased(productCount, _product.name, _product.price, msg.sender, true);


    }
}