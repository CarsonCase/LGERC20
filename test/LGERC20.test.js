const { assert, expect } = require("chai");
const Contract = require('@truffle/contract');
require("chai")
    .use(require("chai-as-promised"))
    .should();

//I know this is bs. I don't care. If it works, it works
const FactoryJson = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const WETHJson = require('@uniswap/v2-periphery/build/WETH.json');
const RouterJson = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
const LGERC20 = artifacts.require('LGERC20');

const UniswapV2Factory= Contract(FactoryJson);
const WETH = Contract(WETHJson);
const Router = Contract(RouterJson);

UniswapV2Factory.setProvider(web3._provider);
WETH.setProvider(web3._provider);
Router.setProvider(web3._provider);

let factory, weth, router, evcoin;

contract("LGERC20",async ([dev,investor])=>{

    function tokens(n){
        return web3.utils.toWei(n,"ether");
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const startingTokens = tokens('1000');
    const devFee = tokens('10');
    const investment = tokens('1');
    const secondsUntilEnd = 10;
    let launchTime;

    before(async()=>{
        factory = await UniswapV2Factory.new(dev,{from: dev});
        weth = await WETH.new({from: dev});
        router = await Router.new(factory.address,weth.address,{from: dev});

        launchTime = Math.floor((Date.now()/1000)+secondsUntilEnd);
        console.log("LAUNCH TIME: "+launchTime);
        lgerc20 = await LGERC20.new(
            startingTokens,
            devFee,
            router.address,
            dev,
            launchTime,
            {from:dev});

    });

    describe("LGERC20 deployment",async()=>{
        it("Has a name",async()=>{
            const name = await lgerc20.name();
            assert.equal(name,"Liquidity Generating ERC20");
        });
        it("Has a symbol",async()=>{
            const symbol = await lgerc20.symbol();
            assert.equal(symbol, "LGERC");
        });
        it("Has LGE tokens",async()=>{
            const tokens = await lgerc20.balanceOf(lgerc20.address);
            assert.equal(tokens,startingTokens);
        });
        it("Has given dev fee",async()=>{
            const balance = await lgerc20.balanceOf(dev);
            assert.equal(balance,devFee);
        });
    });

    describe("Fundrasing",async()=>{
        it("Takes a deposit",async()=>{
            const ts = await lgerc20.test_timestamp();
            console.log("TIMESTAMP BEFORE DEPOSIT: "+ts);
    
            await lgerc20.sendTransaction({from:investor,value:investment});
            const balance = await lgerc20.totalETHContributed();
            assert.equal(balance,investment);
        });    
    });

    describe("LGE End",async()=>{
        it("Created Pair in Uniswap",async()=>{
            console.log("Waiting "+secondsUntilEnd+" seconds for LGE to end...");
            await sleep(secondsUntilEnd*1000);
            console.log("Waiting done");

            await lgerc20.endLGE(100,{from:dev});
            const pairs = await factory.allPairsLength();
            assert.equal(pairs,1);
        });
        it("won't do LGE again",async()=>{
            try{
                await lgerc20.endLGE(100,{from:dev},errTypes.revert);
                throw null;
            }catch(err){
                assert(err);
            }
        })
    })
});


    
