let keycloak = new Keycloak({
    url: "http://localhost:8080/auth/",
    realm: "Binance-bot realm",
    clientId: "0dfd10dc-5d0d-4152-baf5-8ef61b1c8246"
});
keycloak.init().then(function(authenticated) {
    alert(authenticated ? 'authenticated' : 'not authenticated');
}).catch(function() {
    alert('failed to initialize');
});