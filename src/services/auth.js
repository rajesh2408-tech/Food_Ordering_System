export const logout = () => {
    localStorage.removeItem("loggedInUser");
};

export const getLoggedInUser = () => {
    const user = localStorage.getItem("loggedInUser");
    if (!user) {
        return null;
    }
    return JSON.parse(user);
};