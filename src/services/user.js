import axios from "axios";
import { BASE_URL } from "../utils/api";


const postUserData = (data) => {
    axios.post(`${BASE_URL}/users`, data).then((res) => {
            console.log(res.data);
        })
        .catch((err) => {
            alert("Registration Failed");
            console.error(err);
        });
};


const validateCredentials = (x) => {
    return axios.get(`${BASE_URL}/users`)
        .then((res) => {
            let result = res.data;
            let userExists = result.find((user) => user.Email.toLowerCase() === x.email.toLowerCase() && user.Password === x.password);
            if (userExists) {
                alert("Login Successful");
                return userExists;
            } else {
                alert("Invalid Credentials");
                return null;
            }
        })
        .catch((err) => {
            console.log(err);
            alert("Error");
            return null;
        });
};


const postProductData = (data) =>{
    axios.post(`${BASE_URL}/products`,data).then((res)=>{
        alert("Product Added Successfully");
    }).catch((err)=>{
        alert("Product Addition Failed");
    })
}


export {postUserData, validateCredentials, postProductData}