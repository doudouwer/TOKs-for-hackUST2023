// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract HackProperty is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public _creator;
    string public _name;
    string public _description;
    string public _image;
    mapping(uint256=>uint256) public _redemptionStatus;
    mapping(uint256=>uint256) public _amounts;

    event NftMinted(uint256 tokenId, address creator, uint256 amounts);
    event RedemptionStatusChanged(uint256 tokenId, uint256 status);
    event MetadataUpdate(uint256 _tokenId);

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    function mintNft(address creator, string memory name, string memory description, string memory image, uint256 amounts, string memory tokenURI) public onlyOwner{
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _name = name;
        _description = description;
        _image = image;
        _redemptionStatus[newItemId] = 0;
        _creator = creator;
        _amounts[newItemId] = amounts;
        _safeMint(creator, newItemId);
        _setTokenURI(newItemId, tokenURI);
    }

    function setRedemptionStatus(uint256 tokenId, uint256 status, string memory tokenURI) public{
        require(_exists(tokenId), "NFT does not exist");
        if(status == 0 && _redemptionStatus[tokenId]!=3 && ownerOf(tokenId) == msg.sender)
        {
            _redemptionStatus[tokenId] = 0;
            emit RedemptionStatusChanged(tokenId, _redemptionStatus[tokenId]);
            _setTokenURI(tokenId, tokenURI);
            emit MetadataUpdate(tokenId);
            return;
        }
        else if(status == 1 && _redemptionStatus[tokenId] == 0)
        {
            _redemptionStatus[tokenId] = 1;
            emit RedemptionStatusChanged(tokenId, _redemptionStatus[tokenId]);
            _setTokenURI(tokenId, tokenURI);
            emit MetadataUpdate(tokenId);
            return;
        }
        else if(status == 2 && _redemptionStatus[tokenId] == 1)
        {
            _redemptionStatus[tokenId] = 2;
            emit RedemptionStatusChanged(tokenId, _redemptionStatus[tokenId]);
            _setTokenURI(tokenId, tokenURI);
            emit MetadataUpdate(tokenId);
            return;
        }
        else if(status == 3 && _redemptionStatus[tokenId] == 2 && ownerOf(tokenId) == msg.sender)
        {
            _redemptionStatus[tokenId] = 3;
            emit RedemptionStatusChanged(tokenId, _redemptionStatus[tokenId]);
            _setTokenURI(tokenId, tokenURI);
            emit MetadataUpdate(tokenId);
            return;
        }
        else{
            revert("Invalid status transition");
        }
    }

    function creator() public view virtual returns (address){
        return _creator;
    }
}