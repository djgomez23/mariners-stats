// TODO
// add hamburger menu

import React, { useState } from "react";
import { Nav, NavLink, NavMenu } from "./NavbarElements";
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';

function HamburgerMenu() {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // will want to replace the button component eventually with the hamburger menu icon
    return (
        <>
            <Button variant="primary" onClick={handleShow} class="hamburger-menu">
                Hamburger
            </Button>
            <Offcanvas show={show} onHide={handleClose} placement="start">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Damita Gomez</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <NavLink to="/">
                        Home
                    </NavLink>
                    <NavLink to="/about">
                        About
                    </NavLink>
                    <NavLink to="/mariners_stats">
                        Mariners
                    </NavLink>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

const Navbar = () => {
    return (
        <>
            <Nav>
                <NavMenu>
                    <NavLink to="/">
                        Home
                    </NavLink>
                    <NavLink to="/about">
                        About
                    </NavLink>
                    <NavLink to="/mariners_stats">
                        Mariners
                    </NavLink>
                </NavMenu>
            </Nav>
        </>
    );
};

export default Navbar;