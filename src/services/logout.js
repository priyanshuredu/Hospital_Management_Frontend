export const logout = () => {
    sessionStorage.clear();
    window.location.replace("/login"); // Redirects to your login page without saving history
};
