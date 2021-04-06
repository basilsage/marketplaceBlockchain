// check that the contract was dpeloyed to blockchain, has address, and has name

const { assert, expect } = require("chai")

const Marketplace = artifacts.require("Marketplace.sol")

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Marketplace', ([deployer, seller, buyer]) => {
    let marketplace 

    before(async () => {
        marketplace = await Marketplace.deployed()
    })

    describe('deployment', async() => {
        it('deploys succesfully', async() => {
            const address = await marketplace.address
            assert.notEqual(address, 0x0) // make sure address present, not zero
            assert.notEqual(address, '') // make sure address present, not zero
            assert.notEqual(address, null) // make sure address present, not zero
            assert.notEqual(address, undefined) // make sure address present, not zero
        })

        it('has a name', async() => {
            const name = await marketplace.name()
            assert.equal(name, 'Creator Marketplace')
        })
    })

    describe('products', async() => {
        
        let result, productCount 
        
        before(async () => {
            
            result = await marketplace.createProduct('iPhone X', web3.utils.toWei('1', 'Ether'), {from: seller}) // curly braces is meteadata
            // product name, price in wei... 1+18 zeroes, to 1 ethereum
            productCount = await marketplace.productCount()
        })

        it('creates products', async() => {
            // success
            assert.equal(productCount, 1)
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(event.name,'iPhone X' , 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, seller, 'is correct')
            assert.equal(event.purchased, false , 'purchased is correct')

            // failure
            await marketplace.createProduct('', web3.utils.toWei('1', 'Ether'), {from: seller}).should.be.rejected; // curly braces is meteadata
            await marketplace.createProduct('iPhone X', 0, {from: seller}).should.be.rejected; // curly braces is meteadata
        })

        it('lists products', async() => {
            const product = await marketplace.products(productCount)
            assert.equal(product.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(product.name,'iPhone X' , 'name is correct')
            assert.equal(product.price, '1000000000000000000', 'price is correct')
            assert.equal(product.owner, seller, 'is correct')
            assert.equal(product.purchased, false , 'purchased is correct')

        })

        it('sells products', async() => {
            
            // track seller balance before purchase to check against after
            let oldSellerBalance 
            oldSellerBalance = await web3.eth.getBalance(seller)
            oldSellerBalance = new web3.utils.BN(oldSellerBalance)

            // Success, buyer makes purchase
            result = await marketplace.purchaseProduct(productCount, {from : buyer, value: web3.utils.toWei('1', 'Ether')})

            // check logs
            const event = result.logs[0].args
            assert.equal(event.id.toNumber(), productCount.toNumber(), 'id is correct')
            assert.equal(event.name,'iPhone X' , 'name is correct')
            assert.equal(event.price, '1000000000000000000', 'price is correct')
            assert.equal(event.owner, buyer, 'is correct')
            assert.equal(event.purchased, true , 'purchased is correct')

            // check that seller received funds
            
            // check what they had after
            let newSellerBalance 
            newSellerBalance = await web3.eth.getBalance(seller)
            newSellerBalance = new web3.utils.BN(newSellerBalance)

            let price
            price = web3.utils.toWei('1', 'Ether')
            price = new web3.utils.BN(price)

            // console.log(oldSellerBalance, newSellerBalance, price)

            const expectedBalance = oldSellerBalance.add(price)
            assert.equal(newSellerBalance.toString(), expectedBalance.toString())

            //FAILURE: Tries to buy a product that doesn't exist. ie product must have valid ID
            await marketplace.purchaseProduct(99, {from : buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
            
            //FAILURE: send too little ether
            await marketplace.purchaseProduct(productCount, {from : buyer, value: web3.utils.toWei('0.5', 'Ether')}).should.be.rejected;

            //FAILURE: Deployer tries to buy product, ie product can't be purchased twice 
            await marketplace.purchaseProduct(productCount, {from : deployer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

            //FAILURE buyer tries to buy again, ie buyer cant be seller
            await marketplace.purchaseProduct(productCount, {from : buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

        })
    })
})