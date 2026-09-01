import React, { useState } from "react";
import "../../styles/UserLogin.css";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { validateCredentials } from "../../services/user";

const UserLogin = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const EmailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const PasswordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const validate = () => {
        if (!email || !password) {
            alert("All fields are required");
            return false;
        }

        if (!EmailReg.test(email)) {
            alert("Invalid Email");
            return false;
        }

        if (!PasswordReg.test(password)) {
            alert("Password must contain uppercase, lowercase, number, special character and minimum 8 characters");
            return false;
        }
        return true;
    };

    const fetchData = (e) => {
        e.preventDefault();
        if (!validate()) return;
        const data = {email: email, password: password};

        validateCredentials(data).then((user) => {
            if (!user) return;

            // SAVE LOGGED IN USER
            localStorage.setItem("loggedInUser", JSON.stringify(user));

            if (user.Role?.toLowerCase() === "admin") {
                navigate("/admin/admindashboard");
            } else {
                navigate("/");
            }
        });
    };

    return (
        <main className="login-container">
            <article className="login-card">
                <section className="login-img"></section>
                <section className="login-form">
                    <h1>Welcome Back</h1>
                    <p>Please login to continue</p>

                    <form className="login" onSubmit={fetchData}>
                        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}/>
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                        <Link to="#" className="forgot-password">Forgot password?</Link>
                        <button type="submit">Login</button>
                    </form>
                    <small>or login with</small>
                    <div className="social-login">
                        <div><FcGoogle />Google</div>
                        <div><FaFacebook />Facebook</div>
                    </div>

                    <p className="signup">Don't have an account? <Link to="/reg">Sign Up</Link></p>
                </section>
            </article>
        </main>
    );
};

export default UserLogin;