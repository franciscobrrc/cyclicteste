window.addEventListener('beforeunload', function (e) {
    fetch('/logout', { method: 'POST' });
});
