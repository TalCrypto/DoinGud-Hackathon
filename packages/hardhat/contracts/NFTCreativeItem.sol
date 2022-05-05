pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";

contract NFTCreativeItem is ERC1155Supply, Ownable, IERC1155Receiver {

    using EnumerableSet for EnumerableSet.UintSet;
    using Counters for Counters.Counter;

    event ItemSellCreate(address indexed seller, uint256 prodId, uint256 price);
    event ItemSellCancel(address indexed seller, uint256 prodId);
    event ItemBuy(address indexed seller, address indexed buyer, uint256 prodId, uint256 amount, uint256 price);

    struct Product {
        address seller;
        uint256 tokenId;
        uint256 amount;
        uint256 price;
    }

    Counters.Counter private _productIdTracker;

    // prod id => product
    mapping(uint256=>Product) public products;

    EnumerableSet.UintSet onSaleProdIds;

    // seller => prod ids
    mapping(address=>EnumerableSet.UintSet) prodIdsOfSeller;

    constructor(string memory uri) ERC1155(uri) {

    }

    function _putOnSale(address _seller, uint256 _tokenId, uint256 _amount, uint256 _price) private {
        products[_productIdTracker.current()] = Product(_seller, _tokenId, _amount, _price);
        onSaleProdIds.add(_productIdTracker.current());
        prodIdsOfSeller[_seller].add(_productIdTracker.current());
        emit ItemSellCreate(_seller, _productIdTracker.current(), _price);
        _productIdTracker.increment();
    }

    function cancelSale(uint256 _prodId) external {
        require(products[_prodId].seller==_msgSender(), "Not a seller of this product");
        _safeTransferFrom(address(this), _msgSender(), products[_prodId].tokenId, products[_prodId].amount, "");
        delete products[_prodId];
        onSaleProdIds.remove(_prodId);
        prodIdsOfSeller[_msgSender()].remove(_prodId);
        emit ItemSellCancel(_msgSender(), _prodId);
    }

    function buy(uint256 _prodId, uint256 _amount) external payable {
        require(products[_prodId].amount>=_amount, "Insufficient selling amount");
        products[_prodId].amount = products[_prodId].amount - _amount;
        address _seller = products[_prodId].seller;
        require(msg.value >= products[_prodId].price, "Invalid eth value");
        (bool sent, ) = _seller.call{value: products[_prodId].price}("");
        require(sent, "Failed to send eth");        
        _safeTransferFrom(address(this), _msgSender(), products[_prodId].tokenId, _amount, "");
        if(products[_prodId].amount==0){
            onSaleProdIds.remove(_prodId);
            prodIdsOfSeller[_seller].remove(_prodId);
            delete products[_prodId];
        }
        emit ItemBuy(_seller, _msgSender(), _prodId, _amount, products[_prodId].price);
    }

    function getProdutIds() external view returns(uint256[] memory) {
        uint256[] memory prods = new uint256[](onSaleProdIds.length());
        for(uint i=0; i<onSaleProdIds.length(); i++){
            prods[i] = onSaleProdIds.at(i);
        }
        return prods;
    }

    function getProdIdsOfSeller(address _seller) external view returns(uint256[] memory) {
        uint256[] memory prods = new uint256[](prodIdsOfSeller[_seller].length());
        for(uint i=0; i<prodIdsOfSeller[_seller].length(); i++){
            prods[i] = prodIdsOfSeller[_seller].at(i);
        }
        return prods;
    }

    function setUri(string memory uri) external onlyOwner{
        _setURI(uri);
    }

    /**
     * @dev Creates `amount` new tokens for `to`, of token type `id`.
     *
     * See {ERC1155-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the `MINTER_ROLE`.
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount
    ) external onlyOwner {
        _mint(to, id, amount, "");
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] variant of {mint}.
     */
    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) external onlyOwner {
        _mintBatch(to, ids, amounts, "");
    }

    function burn(
        address account,
        uint256 id,
        uint256 value
    ) external {
        require(
            account == _msgSender() || isApprovedForAll(account, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );

        _burn(account, id, value);
    }

    function burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory values
    ) external {
        require(
            account == _msgSender() || isApprovedForAll(account, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );

        _burnBatch(account, ids, values);
    }

    /*                                             ERC1155TokenReceiver                                             */

    /**
     * ERC1155Receiver hook for single transfer.
     * @dev Reverts if the caller is not the whitelisted NFT contract.
     */
    function onERC1155Received(
        address, /*operator*/
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data
    ) external virtual override returns (bytes4) {
        require(address(this) == _msgSender(), "contract not whitelisted");
        (uint256 price) = abi.decode(data, (uint256));
        _putOnSale(from, id, value, price);
        return this.onERC1155Received.selector;
    }

    /**
     * ERC1155Receiver hook for batch transfer.
     * @dev Reverts if the caller is not the whitelisted NFT contract.
     */
    function onERC1155BatchReceived(
        address, /*operator*/
        address, /*from*/
        uint256[] calldata ,
        uint256[] calldata ,
        bytes calldata /*data*/
    ) external virtual override returns (bytes4) {
        return this.supportsInterface.selector;
    }
}
