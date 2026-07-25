// Fungsi untuk memperbarui tampilan nilai slider secara realtime ke Vektor & Skor Rata-rata
function updateValues() {
    const v1 = parseFloat(document.getElementById('dim1').value).toFixed(2);
    const v2 = parseFloat(document.getElementById('dim2').value).toFixed(2);
    const v3 = parseFloat(document.getElementById('dim3').value).toFixed(2);
    const v4 = parseFloat(document.getElementById('dim4').value).toFixed(2);
    const v5 = parseFloat(document.getElementById('dim5').value).toFixed(2);

    document.getElementById('val1Text').innerText = v1;
    document.getElementById('val2Text').innerText = v2;
    document.getElementById('val3Text').innerText = v3;
    document.getElementById('val4Text').innerText = v4;
    document.getElementById('val5Text').innerText = v5;

    const vectorString = `[${v1}, ${v2}, ${v3}, ${v4}, ${v5}]`;
    document.getElementById('vectorDisplay').innerText = vectorString;

    const avg = ((parseFloat(v1) + parseFloat(v2) + parseFloat(v3) + parseFloat(v4) + parseFloat(v5)) / 5).toFixed(2);
    document.getElementById('avgScoreDisplay').innerText = avg;
}

// Fitur Otomatis Nilai Berdasarkan Teks (Mencegah Manipulasi Manual)
document.getElementById('documentText').addEventListener('input', function() {
    const text = this.value.toLowerCase();
    
    if (text.length < 5) {
        // Reset ke nilai default netral jika teks kosong
        document.getElementById('dim1').value = (0.50).toFixed(2);
        document.getElementById('dim2').value = (0.50).toFixed(2);
        document.getElementById('dim3').value = (0.50).toFixed(2);
        document.getElementById('dim4').value = (0.50).toFixed(2);
        document.getElementById('dim5').value = (0.50).toFixed(2);
        updateValues();
        return; 
    }

    // Kamus kata kunci untuk analisis otomatis per dimensi
    const keywordsIntegrity = ['hoaks', 'palsu', 'fitnah', 'bohong', 'fakta', 'valid', 'resmi', 'data akurat'];
    const keywordsEvidence = ['sumber', 'link', 'data', 'riset', 'menurut', 'bukti', 'laporan', 'dokumen'];
    const keywordsRespect = ['bodoh', 'anjing', 'tolol', 'kampret', 'cacat', 'mohon', 'terima kasih', 'sopan', 'diskusi'];
    const keywordsTolerance = ['agama', 'suku', 'ras', 'pendapat lain', 'berbeda', 'mereka', 'umat', 'toleransi'];
    const keywordsDemocratic = ['rakyat', 'negara', 'konstitusi', 'pemilu', 'demokrasi', 'kebijakan', 'publik', 'hak'];

    // Inisialisasi skor dasar
    let score1 = 0.50; 
    let score2 = 0.30;
    let score3 = 0.70;
    let score4 = 0.50;
    let score5 = 0.50;

    // 1. Evaluasi Information Integrity
    if (keywordsIntegrity.some(word => text.includes(word))) {
        score1 = text.includes('hoaks') || text.includes('palsu') || text.includes('fitnah') ? 0.20 : 0.85;
    }

    // 2. Evaluasi Evidence-based Claim
    let matchEvidence = keywordsEvidence.filter(word => text.includes(word)).length;
    score2 = Math.min(0.20 + (matchEvidence * 0.25), 0.95);

    // 3. Evaluasi Respectful Communication
    let hasBadWords = ['bodoh', 'tolol', 'anj', 'bangsat'].some(w => text.includes(w));
    let hasGoodWords = ['mohon', 'terima kasih', 'baik', 'sopan'].some(w => text.includes(w));
    if (hasBadWords) score3 = 0.15;
    else if (hasGoodWords) score3 = 0.90;

    // 4. Evaluasi Tolerance and Diversity
    if (keywordsTolerance.some(word => text.includes(word))) {
        score4 = 0.80;
    }

    // 5. Evaluasi Democratic Responsibility
    if (keywordsDemocratic.some(word => text.includes(word))) {
        score5 = 0.85;
    }

    // Masukkan hasil kalkulasi otomatis ke input/slider tersembunyi/disabled
    document.getElementById('dim1').value = score1.toFixed(2);
    document.getElementById('dim2').value = score2.toFixed(2);
    document.getElementById('dim3').value = score3.toFixed(2);
    document.getElementById('dim4').value = score4.toFixed(2);
    document.getElementById('dim5').value = score5.toFixed(2);

    updateValues();
});

// Data store lokal untuk tabel dokumen tersimpan
let savedDocuments = [];

document.getElementById('annotationForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const text = document.getElementById('documentText').value;
    const label = document.querySelector('input[name="hoaxLabel"]:checked').value;
    const v1 = parseFloat(document.getElementById('dim1').value).toFixed(2);
    const v2 = parseFloat(document.getElementById('dim2').value).toFixed(2);
    const v3 = parseFloat(document.getElementById('dim3').value).toFixed(2);
    const v4 = parseFloat(document.getElementById('dim4').value).toFixed(2);
    const v5 = parseFloat(document.getElementById('dim5').value).toFixed(2);
    const vector = `[${v1}, ${v2}, ${v3}, ${v4}, ${v5}]`;
    const avg = ((parseFloat(v1) + parseFloat(v2) + parseFloat(v3) + parseFloat(v4) + parseFloat(v5)) / 5).toFixed(2);

    savedDocuments.push({ text, label, vector, avg });
    renderTable();

    this.reset();
    updateValues();
});

document.getElementById('resetBtn').addEventListener('click', function() {
    document.getElementById('annotationForm').reset();
    updateValues();
});

document.getElementById('exportBtn').addEventListener('click', function() {
    if (savedDocuments.length === 0) {
        alert('Belum ada data anotasi untuk diekspor.');
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedDocuments, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "dce_annotations.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
});

function renderTable() {
    const tbody = document.getElementById('savedTableBody');
    document.getElementById('tableTitle').innerText = `Dokumen tersimpan (${savedDocuments.length})`;

    if (savedDocuments.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-secondary fst-italic py-3">Belum ada dokumen yang dianotasi.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    savedDocuments.forEach((item) => {
        tbody.innerHTML += `
            <tr class="border-bottom">
                <td class="text-truncate" style="max-width: 250px;" title="${item.text}">${item.text}</td>
                <td><span class="badge ${item.label === 'Hoaks' ? 'bg-danger' : 'bg-success'} fw-normal">${item.label}</span></td>
                <td><code>${item.vector}</code></td>
                <td class="fw-bold">${item.avg}</td>
            </tr>
        `;
    });
}

updateValues();