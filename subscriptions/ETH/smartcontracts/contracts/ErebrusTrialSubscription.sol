// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @title ErebrusTrialSubscription
/// @notice Smart contract for managing subscription-based Soulbound Tokens (SBTs)
contract ErebrusTrialSubscription is Context, AccessControl, ERC721 {
    /// Role definition for admin and operator
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    uint256 public counter;
    
    // Default subscription period (7 days in seconds)
    uint256 public constant DEFAULT_SUBSCRIPTION_PERIOD = 7 * 24 * 60 * 60;
    
    // Structure to store subscription information
    struct Subscription {
        uint256 expirationTime;
        bool isActive;
    }
    
    // Mapping from token ID to subscription info
    mapping(uint256 => Subscription) public subscriptions;
    
    // Mapping for token URIs (active and expired)
    mapping(uint256 => string) private _activeTokenURIs;
    mapping(uint256 => string) private _expiredTokenURIs;
    
    // Events
    event SubscriptionMinted(uint256 indexed tokenId, address indexed owner, uint256 expirationTime);
    event SubscriptionExtended(uint256 indexed tokenId, uint256 newExpirationTime);
    event SubscriptionBurned(uint256 indexed tokenId, address indexed owner);
    
    /// @notice Contract constructor that sets up admin role
    constructor() ERC721("ErebrusSubscription", "EREBSUB") {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);
        _grantRole(ADMIN_ROLE, _msgSender());
        _grantRole(OPERATOR_ROLE, _msgSender());
    }
    
    /// @notice Mint a new subscription token with default expiration
    /// @dev Anyone can mint a subscription token
    function mint(address to) external {
        require(to != address(0), "ErebrusSubscription: Invalid address");
        require(balanceOf(to) == 0, "ErebrusSubscription: Address already has a subscription");
        
        counter++;
        uint256 tokenId = counter;
        
        _mint(to, tokenId);
        
        uint256 expirationTime = block.timestamp + DEFAULT_SUBSCRIPTION_PERIOD;
        
        subscriptions[tokenId] = Subscription({
            expirationTime: expirationTime,
            isActive: true
        });
        
        emit SubscriptionMinted(tokenId, to, expirationTime);
    }
    
    /// @notice Mint a subscription token with custom expiration time
    /// @dev Only operators can delegate mint subscriptions
    function delegateMint(address to, uint256 expirationTime) external onlyRole(OPERATOR_ROLE) {
        require(to != address(0), "ErebrusSubscription: Invalid address");
        require(balanceOf(to) == 0, "ErebrusSubscription: Address already has a subscription");
        require(expirationTime > block.timestamp, "ErebrusSubscription: Expiration time must be in the future");
        
        counter++;
        uint256 tokenId = counter;
        
        _mint(to, tokenId);
        
        subscriptions[tokenId] = Subscription({
            expirationTime: expirationTime,
            isActive: true
        });
        
        emit SubscriptionMinted(tokenId, to, expirationTime);
    }
    
    /// @notice Returns the expiration timestamp for a subscription
    /// @param tokenId The ID of the token to check
    /// @return The timestamp when the subscription expires
    function expiration(uint256 tokenId) external view returns (uint256) {
        _requireOwned(tokenId);
        return subscriptions[tokenId].expirationTime;
    }
    
    /// @notice Checks if a subscription is still valid
    /// @param tokenId The ID of the token to check
    /// @return True if the subscription is valid, false otherwise
    function isValid(uint256 tokenId) external view returns (bool) {
        _requireOwned(tokenId);
        return block.timestamp < subscriptions[tokenId].expirationTime;
    }
    
    /// @notice Extends the expiration time of a subscription
    /// @param tokenId The ID of the token to extend
    /// @param newExpirationTime The new expiration timestamp
    function extend(uint256 tokenId, uint256 newExpirationTime) external onlyRole(OPERATOR_ROLE) {
        _requireOwned(tokenId);
        require(newExpirationTime > block.timestamp, "ErebrusSubscription: New expiration time must be in the future");
        
        subscriptions[tokenId].expirationTime = newExpirationTime;
        
        emit SubscriptionExtended(tokenId, newExpirationTime);
    }
    
    /// @notice Sets the token URIs for active and expired states
    /// @param tokenId The ID of the token
    /// @param uris Array of URIs [activeURI, expiredURI]
    function setTokenURI(uint256 tokenId, string[] memory uris) external onlyRole(OPERATOR_ROLE) {
        _requireOwned(tokenId);
        require(uris.length == 2, "ErebrusSubscription: Must provide exactly 2 URIs (active and expired)");
        
        _activeTokenURIs[tokenId] = uris[0];
        _expiredTokenURIs[tokenId] = uris[1];
    }
    
    /// @notice Burns a subscription token
    /// @param tokenId The ID of the token to burn
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == _msgSender(), "ErebrusSubscription: Not the owner of the token");
        
        _burn(tokenId);
        subscriptions[tokenId].isActive = false;
        
        emit SubscriptionBurned(tokenId, _msgSender());
    }
    
    /// @notice Returns the token URI based on subscription validity
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        
        if (block.timestamp < subscriptions[tokenId].expirationTime) {
            return _activeTokenURIs[tokenId];
        } else {
            return _expiredTokenURIs[tokenId];
        }
    }
    
    /// @notice Prevents transfer of soulbound tokens
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