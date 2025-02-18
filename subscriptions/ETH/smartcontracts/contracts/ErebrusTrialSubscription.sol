// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title NetSepio

contract ErebrusTrialSubscription is Context, AccessControl, ERC721 {
    /// Role definition for admin
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    uint256 public counter;
    mapping(uint256 => string) public _tokenURI;

    event Mint(uint256 tokenId, string metadata);

    /// @notice Contract constructor that sets up admin role
    constructor() ERC721("ErebrusTrialSubscription", "ETS") {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);
        _grantRole(ADMIN_ROLE, _msgSender());
        _grantRole(OPERATOR_ROLE, _msgSender());
    }

    function mint(string memory metadata) external {
        counter++;

        uint256 tokenId = counter;

        _mint(_msgSender(), tokenId);

        _tokenURI[tokenId] = metadata;

        emit Mint(tokenId, metadata);
    }

    function delegateMint(
        address to,
        string memory metadata
    ) public onlyRole(OPERATOR_ROLE) {
        counter++;
        uint256 tokenId = counter;
        _mint(to, tokenId);
        _tokenURI[tokenId] = metadata;
        emit Mint(tokenId, metadata);
    }

    function updateTokenURI(
        uint256 tokenId,
        string memory uri
    ) public onlyRole(OPERATOR_ROLE) {
        _requireOwned(tokenId);
        _tokenURI[tokenId] = uri;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _tokenURI[tokenId];
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer failed");
        }
        return super._update(to, tokenId, auth);
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(AccessControl, ERC721) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
