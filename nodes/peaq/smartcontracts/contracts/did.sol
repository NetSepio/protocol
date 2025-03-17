// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.8.20;


interface DID {

    struct Attribute {
        bytes name;
        bytes value;
        uint32 validity;
        uint256 created;
    }

    function readAttribute(
        address did_account,
        bytes memory name
    ) external view returns (Attribute memory);

    function addAttribute(
        address did_account,
        bytes memory name,
        bytes memory value,
        uint32 validity_for
    ) external returns (bool);

    function updateAttribute(
        address did_account,
        bytes memory name,
        bytes memory value,
        uint32 validity_for
    ) external returns (bool);

    function removeAttribute(
        address did_account,
        bytes memory name
    ) external returns (bool);

    event AddAttribute(
        address sender,
        address did_account,
        bytes name,
        bytes value,
        uint32 validity
    );
    event UpdateAttribute(
        address sender,
        address did_account,
        bytes name,
        bytes value,
        uint32 validity
    );
    event RemoveAttribute(
        address did_account,
        bytes name
    );
}