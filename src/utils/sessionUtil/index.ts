export const session = {
    sessionname: 'ChatAi_Session',
    getToken: function() {
        const token = this.getSession();
        return token;
    },
    setSession: function(token:string) {
        localStorage.setItem(this.sessionname, 'Bearer ' + token)
    },
    getSession: function() {
        const session = localStorage.getItem(this.sessionname) || null;
        return session;
    },
    delSession: function() {
        localStorage.removeItem(this.sessionname);
    },
}