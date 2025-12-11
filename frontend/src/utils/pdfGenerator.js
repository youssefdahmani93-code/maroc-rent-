import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateContractPDF = (contract) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Colors
    const primaryColor = [0, 122, 255]; // Blue
    const secondaryColor = [100, 116, 139]; // Slate 500

    // Helper to add text
    const addText = (text, x, y, size = 10, color = [0, 0, 0], font = 'helvetica', style = 'normal') => {
        doc.setFontSize(size);
        doc.setTextColor(...color);
        doc.setFont(font, style);
        doc.text(text, x, y);
    };

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    addText('RentMaroc', 14, 25, 24, [255, 255, 255], 'helvetica', 'bold');
    addText('Location de voitures de luxe', 14, 32, 10, [255, 255, 255]);

    addText(contract.type === 'devis' ? 'DEVIS' : 'CONTRAT DE LOCATION', pageWidth - 14, 25, 20, [255, 255, 255], 'helvetica', 'bold', 'right');
    addText(`N° ${contract.numero}`, pageWidth - 14, 32, 10, [255, 255, 255], 'helvetica', 'normal', 'right');

    let yPos = 50;

    // Agence Info
    addText('Agence:', 14, yPos, 10, secondaryColor);
    if (contract.agence) {
        addText(contract.agence.nom, 14, yPos + 5, 10);
        addText(contract.agence.ville || '', 14, yPos + 10, 10);
        addText(contract.agence.telephone || '', 14, yPos + 15, 10);
    } else {
        addText('RentMaroc', 14, yPos + 5, 10);
    }

    // Client Info
    addText('Client:', pageWidth / 2 + 10, yPos, 10, secondaryColor);
    addText(contract.client?.nom || 'N/A', pageWidth / 2 + 10, yPos + 5, 10, [0, 0, 0], 'helvetica', 'bold');
    addText(`Tél: ${contract.client?.telephone || 'N/A'}`, pageWidth / 2 + 10, yPos + 10, 10);
    addText(`CIN/Passeport: ${contract.client?.cni_passport || 'N/A'}`, pageWidth / 2 + 10, yPos + 15, 10);
    addText(`Permis: ${contract.client?.permis_conduire || 'N/A'}`, pageWidth / 2 + 10, yPos + 20, 10);

    yPos += 35;

    // Vehicle Info Table
    autoTable(doc, {
        startY: yPos,
        head: [['Véhicule', 'Immatriculation', 'Départ', 'Retour']],
        body: [[
            `${contract.vehicule?.marque} ${contract.vehicule?.modele}`,
            contract.vehicule?.immatriculation,
            `${new Date(contract.date_debut).toLocaleDateString('fr-FR')} à ${new Date(contract.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
            `${new Date(contract.date_fin).toLocaleDateString('fr-FR')} à ${new Date(contract.date_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
        ]],
        theme: 'grid',
        headStyles: { fillColor: primaryColor },
        styles: { fontSize: 10 }
    });

    yPos = doc.lastAutoTable.finalY + 10;

    // Prepare body for Financial Info Table
    const financialBody = [
        ['Location Véhicule', `${contract.nombre_jours} jours`, `${contract.prix_journalier} MAD`, `${(contract.prix_journalier * contract.nombre_jours).toFixed(2)} MAD`]
    ];

    if (contract.frais_livraison > 0) {
        financialBody.push(['Frais Livraison', '1', `${contract.frais_livraison} MAD`, `${contract.frais_livraison} MAD`]);
    }
    if (contract.frais_chauffeur > 0) {
        financialBody.push(['Chauffeur', `${contract.nombre_jours} jours`, `${contract.frais_chauffeur} MAD`, `${contract.frais_chauffeur} MAD`]);
    }
    if (contract.frais_carburant > 0) {
        financialBody.push(['Frais Carburant', '1', `${contract.frais_carburant} MAD`, `${contract.frais_carburant} MAD`]);
    }
    if (contract.frais_depassement_km > 0) {
        financialBody.push(['Frais Km Suppl.', '1', `${contract.frais_depassement_km} MAD`, `${contract.frais_depassement_km} MAD`]);
    }

    // Add Extras
    if (contract.extras && Array.isArray(contract.extras)) {
        contract.extras.forEach(extra => {
            financialBody.push([extra.label, '1', `${extra.prix} MAD`, `${extra.prix} MAD`]);
        });
    }

    if (contract.reduction > 0) {
        financialBody.push(['Réduction', '', '', `-${contract.reduction} MAD`]);
    }

    // Financial Info Table
    autoTable(doc, {
        startY: yPos,
        head: [['Description', 'Qté/Jours', 'Prix Unitaire', 'Total']],
        body: financialBody,
        foot: [
            ['Total HT', '', '', `${(contract.montant_total / 1.2).toFixed(2)} MAD`],
            ['TVA (20%)', '', '', `${(contract.montant_total - (contract.montant_total / 1.2)).toFixed(2)} MAD`],
            ['TOTAL TTC', '', '', `${contract.montant_total} MAD`],
            ['Acompte', '', '', `-${contract.acompte || 0} MAD`],
            ['RESTE À PAYER', '', '', `${contract.reste_a_payer} MAD`]
        ],
        theme: 'striped',
        headStyles: { fillColor: secondaryColor },
        footStyles: { fillColor: primaryColor, fontStyle: 'bold' }
    });

    yPos = doc.lastAutoTable.finalY + 20;

    // Terms
    addText('Conditions Générales:', 14, yPos, 10, [0, 0, 0], 'helvetica', 'bold');
    yPos += 7;
    doc.setFontSize(8);
    doc.setTextColor(100);
    const terms = "Le locataire déclare avoir reçu le véhicule en bon état de marche et de carrosserie. Le carburant est à la charge du locataire. En cas d'accident, la franchise est de 5% de la valeur du véhicule. Le locataire s'engage à ne pas sous-louer le véhicule.";
    const splitTerms = doc.splitTextToSize(terms, pageWidth - 28);
    doc.text(splitTerms, 14, yPos);

    yPos += 30;

    // Signatures
    addText('Signature Agence', 14, yPos, 10, [0, 0, 0], 'helvetica', 'bold');
    addText('Signature Client', pageWidth - 60, yPos, 10, [0, 0, 0], 'helvetica', 'bold');

    addText('Lu et approuvé', pageWidth - 60, yPos + 5, 8, secondaryColor, 'helvetica', 'italic');

    // Save
    doc.save(`${contract.type}_${contract.numero}.pdf`);
};
