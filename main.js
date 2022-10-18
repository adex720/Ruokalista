function alustaNapit() {
    document.getElementById('edellinen').addEventListener('mouseup', () => { window.location.href = getNewPage(-1); }, false)
    document.getElementById('seuraava').addEventListener('mouseup', () => { window.location.href = getNewPage(+1); }, false)
}

function getNewPage(delta) {
    var current = window.location.href;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (!queryString.includes('?')) {
        return current + '?paiva=' + delta;
    }
    if (urlParams.has('paiva')) {
        var paiva = parseInt(urlParams.get('paiva')) + delta;

        if (paiva >= 7) paiva = paiva % 7;
        while (paiva < 0) paiva += 7;

        urlParams.set('paiva', paiva);
        return window.location.pathname + '?' + urlParams.toString();
    }
    return current + '&paiva=' + delta;
}

function getJSON(url, callback) {

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = () => {

        let status = xhr.status;

        if (status == 200) {
            callback(null, xhr.response);
        } else {
            callback(status);
        }
    };

    xhr.send();
}

function teeRuokalista() {
    const response = getJSON('https://www.sodexo.fi/ruokalistat/output/weekly_json/84', (err, data) => {

        if (err != null) {
            console.error(err);
        } else {
            var tanaan = data.mealdates[getDayId()];

            if (tanaan == undefined) {
                eiKoulua();
                return;
            }
            var ruuat = tanaan.courses;

            var sekaruoka;
            var kasvisruoka;

            if (ruuat[2] != undefined) {
                sekaruoka = ruuat[1].title_fi;
                kasvisruoka = ruuat[2].title_fi;
            } else {
                sekaruoka = undefined;
                kasvisruoka = ruuat[1].title_fi;
            }

            paivita(sekaruoka, kasvisruoka,);
        }

    });
}

function getDate() {
    var date = new Date();
    var newDay = date.getDate() + paivaEro;
    date.setDate(newDay);
    return date;
}

function getDayId() {
    return getDate().getDay() - 1;
}

function paivanNimi() {
    var date = getDate();

    var paiva = date.getDate();
    var kuukausi = date.getMonth() + 1;
    var viikonpaivaId = date.getDay();

    var viikonpaiva;
    switch (viikonpaivaId) {
        case 0: viikonpaiva = 'Su'; break;
        case 1: viikonpaiva = 'Ma'; break;
        case 2: viikonpaiva = 'Ti'; break;
        case 3: viikonpaiva = 'Ke'; break;
        case 4: viikonpaiva = 'To'; break;
        case 5: viikonpaiva = 'Pe'; break;
        case 6: viikonpaiva = 'La';
    }

    return viikonpaiva + ' ' + paiva + '.' + kuukausi + '.';
}

function paivita(sekaruoka, kasvisruoka) {
    document.getElementById('otsikko').textContent = paivanNimi() + ' ruokalista:';

    if (sekaruoka != undefined) {
        document.getElementById('ruoka_sr').textContent = sekaruoka;
        document.getElementById('ruoka_ka').textContent = kasvisruoka;

        return;
    }

    document.getElementById('seka').style.display = 'none';
    document.getElementById('ruoka_ka').textContent = kasvisruoka;
}

function eiKoulua() {
    document.getElementById('otsikko').textContent = paivanNimi() + ' ruokalista:';
    const otsikko = document.createElement('h1');
    otsikko.textContent = 'Tänään ei ole koulua ):';
    otsikko.className = 'info';
    document.getElementById('otsikko').parentElement.appendChild(otsikko);

    document.getElementById('seka').style.display = 'none';
    document.getElementById('kasvis').style.display = 'none';
}

function laskePaivaEro() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    var paiva = urlParams.get('paiva');
    if (paiva == undefined) return 0;
    paiva = parseInt(paiva);

    var ero;
    if (paiva > -7 && paiva < 7) {
        if (paiva >= 0) ero = paiva;
        else ero = 7 + paiva;
    } else {
        paiva = paiva % 7;
        if (paiva >= 0) ero = paiva;
        else ero = 7 - paiva;
    }

    var tanaanPaivaId = new Date().getDay() - 1;
    if (tanaanPaivaId == -1) tanaanPaivaId = 6;

    var uusiPaivaId = tanaanPaivaId + ero;
    if (uusiPaivaId >= 7) uusiPaivaId -= 7;

    if (uusiPaivaId < tanaanPaivaId) ero -= 7;
    return ero;
}

var paivaEro = laskePaivaEro();

alustaNapit();
teeRuokalista();