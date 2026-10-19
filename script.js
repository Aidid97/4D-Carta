class MesinMatriksPro {
    constructor() {
        this.MIRROR_MAP = {
            '0':'5', '1':'6', '2':'7', '3':'8', '4':'9',
            '5':'0', '6':'1', '7':'2', '8':'3', '9':'4'
        };
    }

    sortCombo(str) { 
        return str.split('').sort().join(''); 
    }

    getMirror(str) {
        return str.split('').map(c => this.MIRROR_MAP[c] || c).join('');
    }

    binaMatrix4x4(str1, str2) {
        let combined = (str1 + (str2 || "8040")).replace(/[^0-9]/g, '');
        if (combined.length < 4) combined = "5829";
        let baseRow = combined.substring(0, 4).split('').map(Number);
        
        let matrix = [baseRow];
        for (let r = 1; r < 4; r++) {
            let row = [];
            for (let c = 0; c < 4; c++) {
                let val = (matrix[r - 1][c] + 9) % 10;
                row.push(val);
            }
            matrix.push(row);
        }
        return matrix;
    }

    uraiAkar(nomborAsas) {
        let digits = nomborAsas.split('').map(Number);
        let sum = digits.reduce((a, b) => a + b, 0); 
        let sumStr = sum.toString();
        let sumDigits = sumStr.split('').map(Number);
        
        let cabangTambah = sumDigits.reduce((a, b) => a + b, 0);
        let cabangTolak = sumDigits.length > 1 ? Math.abs(sumDigits[0] - sumDigits[1]) : sumDigits[0];
        
        let rawData = nomborAsas + sumStr + cabangTambah.toString() + cabangTolak.toString();
        return { 
            akar: sum, 
            cabangTolak: cabangTolak.toString(),
            cabangTambah: cabangTambah.toString(),
            rawData: rawData 
        };
    }

    kiraTrajektori(sejarahCabutan, operator) {
        let skor = [];
        let t3 = sejarahCabutan.slice(0, 3).join('');
        let t5 = sejarahCabutan.slice(0, 5).join('');
        let t15 = sejarahCabutan.slice(0, 15).join('');

        let w_micro = 0.5;
        let w_velocity = 0.5;

        if (operator === 'gdlotto') {
            w_micro = 0.7;
            w_velocity = 0.3;
        } else if (operator === 'magnum') {
            w_micro = 0.55;
            w_velocity = 0.45;
        }

        for (let i = 0; i <= 9; i++) {
            let d = i.toString();
            let f_mikro = t3.split(d).length - 1;
            let c_t5 = t5.split(d).length - 1;
            let c_t15 = t15.split(d).length - 1;
            
            let halaju = (c_t5 / 5.0) - (c_t15 / 15.0);
            skor.push({ digit: d, skor: (w_micro * f_mikro) + (w_velocity * halaju) });
        }
        return skor.sort((a, b) => b.skor - a.skor).map(x => x.digit);
    }

    ekstrakPolaMatrix(m) {
        return {
            "Pola L": { v: `${m[0][0]}${m[1][0]}${m[2][0]}${m[2][1]}`, c: [[0,0],[1,0],[2,0],[2,1]] },
            "Pola T": { v: `${m[0][0]}${m[0][1]}${m[0][2]}${m[1][1]}`, c: [[0,0],[0,1],[0,2],[1,1]] },
            "Pola Y": { v: `${m[0][0]}${m[0][2]}${m[1][1]}${m[2][1]}`, c: [[0,0],[0,2],[1,1],[2,1]] },
            "Pola O": { v: `${m[1][1]}${m[1][2]}${m[2][1]}${m[2][2]}`, c: [[1,1],[1,2],[2,1],[2,2]] },
            "Pepenjuru 1": { v: `${m[0][0]}${m[1][1]}${m[2][2]}${m[3][3]}`, c: [[0,0],[1,1],[2,2],[3,3]] },
            "Pepenjuru 2": { v: `${m[0][3]}${m[1][2]}${m[2][1]}${m[3][0]}`, c: [[0,3],[1,2],[2,1],[3,0]] },
            "Zig Kiri": { v: `${m[0][0]}${m[1][1]}${m[2][0]}${m[3][1]}`, c: [[0,0],[1,1],[2,0],[3,1]] },
            "Zig Kanan": { v: `${m[0][3]}${m[1][2]}${m[2][3]}${m[3][2]}`, c: [[0,3],[1,2],[2,3],[3,2]] }
        };
    }

    cariPelengkapEmasPro(kombinasi3D, dataAkar, coldPivot) {
        let pelengkapTier = [];

        if (!kombinasi3D.includes(dataAkar.cabangTolak)) {
            pelengkapTier.push(dataAkar.cabangTolak);
        }

        if (coldPivot.length > 0 && !kombinasi3D.includes(coldPivot[0])) {
            pelengkapTier.push(coldPivot[0]);
        }

        kombinasi3D.split('').forEach(digit => {
            let cermin = this.MIRROR_MAP[digit];
            if (!kombinasi3D.includes(cermin) && dataAkar.rawData.includes(cermin)) {
                pelengkapTier.push(cermin);
            }
        });

        coldPivot.slice(1).forEach(p => {
            if (!kombinasi3D.includes(p)) pelengkapTier.push(p);
        });

        return [...new Set(pelengkapTier)];
    }

    jana(nomborAsas, str2, sejarahCabutan, gunaCermin, operator) {
        let isGDLotto = (operator === 'gdlotto');
        let isMagnum = (operator === 'magnum');
        
        let matrix = this.binaMatrix4x4(nomborAsas, str2);
        let dataAkar = this.uraiAkar(nomborAsas + (str2 || ""));
        let trajektori = this.kiraTrajektori(sejarahCabutan, operator);
        
        let hotDigits = trajektori.slice(0, 4); 
        let coldPivot = (isGDLotto || isMagnum) ? trajektori.slice(-4) : trajektori.slice(-3); 
        let hot1D = hotDigits[0];
        let hot2D_pair = hotDigits[0] + hotDigits[1];

        let anchors2D = new Set();
        for (let i = 0; i < hotDigits.length; i++) {
            for (let j = i + 1; j < hotDigits.length; j++) {
                anchors2D.add(this.sortCombo(hotDigits[i] + hotDigits[j]));
            }
        }
        if (gunaCermin) {
            hotDigits.forEach(d => {
                anchors2D.add(this.sortCombo(d + this.MIRROR_MAP[d]));
            });
        }
        let array2D = Array.from(anchors2D);

        let primary3D = this.sortCombo(hotDigits.slice(0, 3).join(''));
        let solidCore3D = primary3D;
        if (gunaCermin && dataAkar.rawData.includes(this.MIRROR_MAP[hotDigits[0]])) {
            solidCore3D = this.sortCombo(primary3D.replace(hotDigits[0], this.MIRROR_MAP[hotDigits[0]]));
        }

        let array3DMuktamad = [solidCore3D];

        let set4D = new Set();
        let golden1DList = [];

        array3DMuktamad.forEach(kombo3D => {
            let senaraiPelengkap = this.cariPelengkapEmasPro(kombo3D, dataAkar, coldPivot);
            if (senaraiPelengkap.length > 0) {
                golden1DList.push(...senaraiPelengkap);
            }
            senaraiPelengkap.forEach(p => {
                set4D.add(this.sortCombo(kombo3D + p));
            });
        });

        let singleGolden1D = dataAkar.cabangTolak;
        if (solidCore3D.includes(singleGolden1D)) {
            singleGolden1D = coldPivot[0];
        }
        if (solidCore3D.includes(singleGolden1D)) {
            singleGolden1D = golden1DList.find(d => !solidCore3D.includes(d)) || "2";
        }

        let target4D = this.sortCombo(solidCore3D + singleGolden1D);

        return {
            matrix: matrix,
            tunjang: hotDigits,
            pivot: coldPivot,
            hot1D: hot1D,
            hot2DPair: hot2D_pair,
            solidCore3D: solidCore3D,
            golden1D: singleGolden1D,
            target4D: target4D,
            keputusan2D: array2D,
            keputusan3D: array3DMuktamad,
            keputusan4D: Array.from(set4D),
            polaObj: this.ekstrakPolaMatrix(matrix)
        };
    }
}

const enjin = new MesinMatriksPro();
let globalHasil = null;

function janaKeputusan() {
    const str1 = document.getElementById('num1').value.trim();
    const str2 = document.getElementById('num2').value.trim();
    const historyRaw = document.getElementById('history').value.trim();
    const gunaCermin = document.getElementById('useMirror').checked;
    const operator = document.getElementById('operator').value;

    if (str1.length < 3) {
        alert("Silakan masukkan nombor induk yang valid (minimal 3D/4D).");
        return;
    }

    let sejarahCabutan = historyRaw.match(/\b\d{4}\b/g);
    if (!sejarahCabutan || sejarahCabutan.length < 3) {
        sejarahCabutan = ["1508", "5241", "6336", "2203", "4065", "2464", "0431", "2182", "2275", "9055"];
    }

    globalHasil = enjin.jana(str1, str2, sejarahCabutan, gunaCermin, operator);

    lukisJadual(globalHasil.matrix);
    highlightStrategyBox(globalHasil.matrix, globalHasil.hot1D, globalHasil.golden1D);

    document.getElementById('master-key').innerText = globalHasil.tunjang.join(' - ');
    document.getElementById('pivot-keys').innerText = globalHasil.pivot.join(', ');
    document.getElementById('mode-badge').innerText = operator.toUpperCase();

    document.getElementById('h1D').innerText = `${globalHasil.hot1D} & ${globalHasil.tunjang[1]}`;
    document.getElementById('h2D').innerText = `${globalHasil.hot2DPair} / ${globalHasil.sortCombo(globalHasil.hot2DPair)}`;
    document.getElementById('a3D').innerText = globalHasil.solidCore3D;
    document.getElementById('p1D').innerText = globalHasil.golden1D;
    document.getElementById('s4D').innerText = globalHasil.target4D;

    document.getElementById('out-2d').innerHTML = globalHasil.keputusan2D.map(n => `<div class="number-tag anchor-tag">${n}</div>`).join('');
    document.getElementById('out-2d').setAttribute('data-raw', globalHasil.keputusan2D.join(', '));

    document.getElementById('out-3d').innerHTML = globalHasil.keputusan3D.map(n => `<div class="number-tag" style="background:#d69e2e;">${n}</div>`).join('');
    document.getElementById('out-3d').setAttribute('data-raw', globalHasil.keputusan3D.join(', '));

    document.getElementById('out-4d').innerHTML = globalHasil.keputusan4D.map(n => `<div class="number-tag" style="background:#805ad5;">${n}</div>`).join('');
    document.getElementById('out-4d').setAttribute('data-raw', globalHasil.keputusan4D.join(', '));

    renderPolaGrid(globalHasil.polaObj, gunaCermin);
    kocokPolaVisual();

    document.getElementById('hasil').style.display = 'block';
}

function lukisJadual(m) {
    let h = ""; 
    for (let r = 0; r < 4; r++) { 
        h += "<tr>"; 
        for (let c = 0; c < 4; c++) {
            h += `<td id="c-${r}-${c}">${m[r][c]}</td>`; 
        }
        h += "</tr>"; 
    }
    document.getElementById("matrixTable").innerHTML = h;
}

function highlightStrategyBox(m, hot1D, golden1D) {
    document.querySelectorAll('td').forEach(td => td.className = "");
    let found = false;
    for (let r = 0; r < 3; r++) { 
        for (let c = 0; c < 3; c++) { 
            let block = [m[r][c], m[r][c + 1], m[r + 1][c], m[r + 1][c + 1]];
            if (block.includes(parseInt(hot1D))) {
                [`c-${r}-${c}`, `c-${r}-${c+1}`, `c-${r+1}-${c}`, `c-${r+1}-${c+1}`].forEach(id => {
                    let el = document.getElementById(id);
                    if (el) el.classList.add('highlight-box');
                });
                found = true;
                break;
            } 
        } 
        if (found) break; 
    }
}

function kocokPolaVisual() {
    if (!globalHasil) return;
    let pObj = globalHasil.polaObj;
    let keys = Object.keys(pObj);
    let gunaCermin = document.getElementById("useMirror").checked;

    document.querySelectorAll('td').forEach(td => td.classList.remove('highlight-3d', 'highlight-2d'));

    let k3 = keys[Math.floor(Math.random() * keys.length)];
    let d3 = pObj[k3];
    let m3 = Math.floor(Math.random() * 2);
    let v3 = d3.v.substr(m3, 3);
    let c3 = d3.c.slice(m3, m3 + 3);
    let l3 = k3;
    if (gunaCermin && Math.random() > 0.5) { v3 = enjin.getMirror(v3); l3 += " (Cermin)"; }

    let k2 = keys[Math.floor(Math.random() * keys.length)];
    let d2 = pObj[k2];
    let m2 = Math.floor(Math.random() * 3);
    let v2 = d2.v.substr(m2, 2);
    let c2 = d2.c.slice(m2, m2 + 2);
    let l2 = k2;
    if (gunaCermin && Math.random() > 0.5) { v2 = enjin.getMirror(v2); l2 += " (Cermin)"; }

    document.getElementById("src3D").innerText = `Pola: ${l3} [${d3.v}]`; 
    document.getElementById("val3D").innerText = v3;
    document.getElementById("src2D").innerText = `Pola: ${l2} [${d2.v}]`; 
    document.getElementById("val2D").innerText = v2;

    c3.forEach(c => {
        let el = document.getElementById(`c-${c[0]}-${c[1]}`);
        if (el) el.classList.add('highlight-3d');
    });
    c2.forEach(c => {
        let el = document.getElementById(`c-${c[0]}-${c[1]}`);
        if (el) el.classList.add('highlight-2d');
    });
}

function renderPolaGrid(pObj, gunaCermin) {
    let html = "";
    for (let [n, d] of Object.entries(pObj)) {
        html += `<div class="pattern-box">
            <span class="pattern-name">${n}</span>
            <span class="pattern-value">${d.v}</span>
            <span style="font-size:11px;color:#17a2b8;font-weight:bold;">${gunaCermin ? 'Cermin: ' + enjin.getMirror(d.v) : ''}</span>
        </div>`;
    }
    document.getElementById("gridPola").innerHTML = html;
}

function resetBorang() {
    document.getElementById('num1').value = '';
    document.getElementById('num2').value = '';
    document.getElementById('history').value = '';
    document.getElementById('hasil').style.display = 'none';
    globalHasil = null;
}

function salin(id) {
    const txt = document.getElementById(id).getAttribute('data-raw');
    if (txt) {
        navigator.clipboard.writeText(txt).then(() => alert("Berhasil disalin: " + txt));
    }
                }
      
