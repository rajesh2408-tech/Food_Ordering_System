import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/UserReg.css";
import { BASE_URL } from "../../utils/api";
import { postUserData } from "../../services/user";

const UserReg = () => {
    const navigate = useNavigate();

    const [Name, setName] = useState("");
    const [Email, setEmail] = useState("");
    const [Password, setPassword] = useState("");
    const [ConfirmPassword, setConfirmPassword] = useState("");
    const [MobileNumber, setMobileNumber] = useState("");
    const [Gender, setGender] = useState("");
    const [Country, setCountry] = useState("");
    const [Terms, setTerms] = useState(false);

    const NameReg = /^[A-Za-z ]{3,30}$/;
    const EmailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const PasswordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const MobileReg = /^[6-9][0-9]{9}$/;

    const validate = () => {

        if (!Name || !Email || !Password || !ConfirmPassword || !MobileNumber || !Gender || !Country) {
            alert("All fields are required");
            return false;
        }

        if (!NameReg.test(Name)) {
            alert("Invalid Name");
            return false;
        }

        if (!EmailReg.test(Email)) {
            alert("Invalid Email");
            return false;
        }
        if (!PasswordReg.test(Password)) {
            alert("Password must contain at least 8 characters, including uppercase, lowercase, number and special character.");
            return false;
        }
        if (Password !== ConfirmPassword) {
            alert("Passwords do not match");
            return false;
        }
        if (!MobileReg.test(MobileNumber)) {
            alert("Invalid Mobile Number");
            return false;
        }
        if (!Terms) {
            alert("Please agree to the terms and conditions");
            return false;
        }
        return true;
    };

    const POSTDATA = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        const data = {Name, Email, Password, ConfirmPassword, MobileNumber, Gender, Country};
        try {
            const res = await axios.get(`${BASE_URL}/users`);
            const emailExists = res.data.find((user) => user.Email?.toLowerCase() === Email.trim().toLowerCase());

            if (emailExists) {
                alert("Email already exists");
                return;
            }

            await postUserData(data);
            alert("Registration successful");
            navigate("/login");

        } catch (error) {
            console.error(error);
            alert("Something went wrong");
        }
    };

    return (
        <main className="reg-container">
            <section className="reg-img"></section>
            <section className="reg-form-container">
                <form className="reg-form" onSubmit={POSTDATA}>
                    <div className="reg-form-header">
                        <h1>Register</h1>
                        <p>JOIN OUR FASHION COMMUNITY</p>
                    </div>
                    <input type="text" placeholder="Enter Name" value={Name} onChange={(e) => setName(e.target.value)} />
                    <input type="email" placeholder="Enter Email" value={Email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Enter Password" value={Password} onChange={(e) => setPassword(e.target.value)} />
                    <input type="password" placeholder="Confirm Password" value={ConfirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    <input type="tel" placeholder="Enter Mobile Number" value={MobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
                    <div className="gender-country">

                        <div className="gender">
                            <label>Gender:</label>
                            <label>
                                <input type="radio" name="gender" value="male" checked={Gender === "male"} onChange={(e) => setGender(e.target.value)} />
                                Male
                            </label>
                            <label>
                                <input type="radio" name="gender" value="female" checked={Gender === "female"} onChange={(e) => setGender(e.target.value)} />
                                Female
                            </label>
                            <label>
                                <input type="radio" name="gender" value="other" checked={Gender === "other"} onChange={(e) => setGender(e.target.value)} />
                                Other
                            </label>
                        </div>

                        <div className="country">
                            <label>Country</label>

                            <select value={Country} onChange={(e) => setCountry(e.target.value)}>
                                <option value="">Select Country</option>
                                <option value="india">India</option>
                                <option value="russia">Russia</option>
                                <option value="japan">Japan</option>
                                <option value="nepal">Nepal</option>
                                <option value="bhutan">Bhutan</option>
                                <option value="china">China</option>
                                <option value="america">America</option>
                                <option value="uk">UK</option>
                                <option value="norway">Norway</option>
                                <option value="germany">Germany</option>
                                <option value="sweden">Sweden</option>
                                <option value="denmark">Denmark</option>
                                <option value="finland">Finland</option>
                                <option value="switzerland">Switzerland</option>
                                <option value="italy">Italy</option>
                                <option value="belgium">Belgium</option>
                                <option value="france">France</option>
                                <option value="spain">Spain</option>
                                <option value="portugal">Portugal</option>
                                <option value="ireland">Ireland</option>
                                <option value="netherlands">Netherlands</option>
                                <option value="austria">Austria</option>
                            </select>
                        </div>
                    </div>
                    <div className="terms">
                        <input type="checkbox" id="terms" checked={Terms} onChange={(e) => setTerms(e.target.checked)} />
                        <label htmlFor="terms">I agree to the terms and conditions</label>
                    </div>
                    <button type="submit">Register</button>
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </form>
            </section>
        </main>
    );
};

export default UserReg;