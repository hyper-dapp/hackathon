// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import './tokens/ERC721URIStorage.sol';
import './interfaces/IERC20.sol';
import './utils/ownable.sol';
import './libraries/Strings.sol';
import './libraries/SafeTransfers.sol';

contract CortexHub is ERC721URIStorage, Ownable {
  using Strings for address;

  mapping(address => uint) private _tokens;
  uint private _counter;

  modifier onlyOwnerOrAdmin(uint tokenId) {
    require(msg.sender == owner || tokenOf(msg.sender) == tokenId, "CortexHub::onlyOwnerOrAdmin: Invalid signer address.");
    _;
  }

  constructor() ERC721("CortexArtifact", "CORA") {}

  function tokenOf(address account) public view returns (uint) {
    return _tokens[account];
  }

  function revoke(uint tokenId) external onlyOwnerOrAdmin(tokenId) {
    address owner = ownerOf(tokenId);
    require(owner != address(0), "CortexHub::revoke: Invalid Cortex ID");
    delete _tokens[owner];
    emit CortexRemoved(tokenId, owner, msg.sender);
  }

  function mintCortexArtifact(string memory _cid) private {
    _counter += 1;
    _safeMint(msg.sender, _counter);
    _setTokenURI(_counter, string(abi.encodePacked('https://ipfs.io/ipfs/', _cid)));
    _tokens[msg.sender] = _counter;

    emit CortexMintSuccess(msg.sender, _counter);
  }

  function withdraw(uint _amount) external onlyOwner {
    uint balance = address(this).balance;
    require(_amount <= balance, "CortexHub::withdraw: Insufficient balance");
    SafeTransfers.safeTransferETH(msg.sender, balance);
  }

  function tokenBalance(address _tokenContract) view public returns (uint) {
    IERC20 token = IERC20(_tokenContract);
    return token.balanceOf(address(this));
  }

  function withdrawToken(address _tokenContract, uint _amount) external onlyOwner {
    require(_amount <= tokenBalance(_tokenContract), "CortexHub::withdrawToken: Insufficient balance");
    SafeTransfers.safeTransfer(_tokenContract, msg.sender, _amount);
  }

  receive() external payable {}

  event CortexMintSuccess(address indexed _account, uint indexed _tokenId);
  event CortexRemoved(uint indexed _tokenId, address indexed _account, address indexed _revoker);
}
