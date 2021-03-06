// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import '@openzeppelin/contracts/access/Ownable.sol';


/**
* @title LGERC20. An ERC20 variant with Uniswap LGE features
* @author Carson Case (carsonpcase@gmail.com) 
 */
contract LGERC20 is ERC20, Ownable{
    /* =====Events=====*/
    event ethRaised(address,uint256);

    /* =====State Variables=====*/
    uint256 public immutable LGESupply;
    uint256 public totalETHContributed;
    uint256 public immutable endTime;
    address public immutable  LPTokenReceiver;
    bool public LGEComplete = false;

    /*=====Data Structures=====*/
    mapping(address => uint256) public contributers;
    address[] public contributerList;

    /*=====Interfaces=====*/
    IUniswapV2Router02 public immutable UniswapV2Router02;
    
    /*=====Constructor=====*/
    constructor(    
    uint256 _LGESupply,                     //->ERC20 Tokens to be minted for LGE
    uint256 _devFee,                        //->ERC20 Tokens to be minted for Dev Fee                  
    address _UniswapV2Router02,             //->Address of Uniswap Router             
    address _LPTokenReceiver,               //->Address of the recipitent of Liquidity tokens      
    uint256 _endTime)                       //->End time for LGE               
    ERC20("Liquidity Generating ERC20", "LGERC")
    Ownable()
    {
        UniswapV2Router02 = IUniswapV2Router02(_UniswapV2Router02);     //Initialize Uniswap router
        LGESupply = _LGESupply;                                         //Note tokens to be sent off in LGE
        _mint(address(this),_LGESupply);                                //Mint those tokens to contract
        _mint(msg.sender,_devFee);                                      //Mint dev fee
        LPTokenReceiver = _LPTokenReceiver;                             //LP Token receiver
        endTime = _endTime;                                             //End time
    }

    /**
    * @dev receive function is how you contribute. Can only do when LGE is on
     */
    receive() payable external{
        require(!_isOver());                                                        //Require LGE is still going on
        emit ethRaised(msg.sender,msg.value);
        totalETHContributed += msg.value;                                           //Increase total value of ETH raised
        contributerList.push(msg.sender);                                           //Push to list of contributers                                           
        contributers[msg.sender] = msg.value;                                       //Note how much was contributed
    }   

    /**
    * @dev sweep function removes tokens in contract and sends em to owner
    * @notice sweep can only be prefomed after LGE so as to aleviate rug concerns
    * function is mostly for tokens sent by mistake, or for things with LP tokens
    * @param _token to sweep
     */
    function sweep(address _token) external onlyOwner{
        require(_isOver(), "LGE must be complete");
        uint256 bal = IERC20(_token).balanceOf(address(this));
        IERC20(_token).transfer(owner(), bal);
    }
    /**
    * @dev at end of LGE the liquidity is sent to uniswap
    * @param _timeout is the uniswap addLiquidityEth timeout param
     */
    function endLGE(uint256 _timeout) public{
        //requires
        require(_isOver());                                                         //Require LGE is over
        require(!LGEComplete);                                                      //Require LGE is not already completed

        this.approve(address(UniswapV2Router02),LGESupply);                         //Approve LGE tokens to be sent off

        UniswapV2Router02.addLiquidityETH                                           //Send the liquidity to Uniswap
        {value:address(this).balance}                                               //Ammount of ETH to send
        (             
            address(this),                                                          //Address of non-eth token
            LGESupply,                                                              //Ammount of tokens
            0,  //For these refer to                                                                    
            0,  //Uniswap docs
            LPTokenReceiver,                                                        //Recipitent of tokens
            block.timestamp+_timeout);                                                          //Timeout to revert
       
        LGEComplete = true;                                                         //Set LGE to complete
    }

    /**
    * @dev returns true if LGE is over 
    */
    function _isOver() private view returns(bool){
        if(block.timestamp >= endTime){
            return true;
        }else{
            return false;
        }
    }

}

