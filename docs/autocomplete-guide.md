# Guide d'utilisation - Recherche Autocomplete

## ✨ Nouvelles fonctionnalités

Le composant **SearchableSelect** a été amélioré avec une navigation complète au clavier pour une meilleure expérience utilisateur.

### 🎯 Où le trouver?

Le composant est déjà utilisé dans **tous les formulaires** de l'application:

- ✅ **Réservations** - Sélection de véhicules, clients, agences
- ✅ **Contrats/Factures** - Sélection de véhicules, clients, agences
- ✅ **Paiements** - Sélection de clients, contrats
- ✅ **Maintenance** - Sélection de véhicules

---

## ⌨️ Raccourcis clavier

| Touche | Action |
|--------|--------|
| **↓** (Flèche bas) | Descendre dans la liste |
| **↑** (Flèche haut) | Monter dans la liste |
| **Enter** | Sélectionner l'élément surligné |
| **Escape** | Fermer la liste |
| **Space** | Ouvrir la liste (quand fermée) |
| **Taper du texte** | Filtrer les résultats |

---

## 🖱️ Utilisation à la souris

1. **Cliquer** sur le champ pour ouvrir la liste
2. **Taper** pour rechercher (ex: "Renault", "Ahmed", etc.)
3. **Survoler** un élément pour le mettre en surbrillance
4. **Cliquer** sur un élément pour le sélectionner

---

## 💡 Fonctionnalités

### Recherche intelligente
- Recherche instantanée pendant la frappe
- Insensible à la casse (majuscules/minuscules)
- Recherche dans tous les champs affichés

### Navigation fluide
- Défilement automatique vers l'élément surligné
- Indicateur visuel de l'élément sélectionné (fond cyan)
- Indicateur visuel de l'élément surligné (fond gris)

### Accessibilité
- Support complet du clavier
- Attributs ARIA pour lecteurs d'écran
- Focus visible et navigation logique

---

## 📱 Responsive

Le composant fonctionne parfaitement sur:
- 💻 **Desktop** - Navigation clavier complète
- 📱 **Mobile** - Touch optimisé
- 📲 **Tablette** - Hybride clavier/touch

---

## 🎨 Personnalisation

Le composant supporte:

### Rendu personnalisé
```jsx
<SearchableSelect
    options={vehicleOptions}
    value={formData.vehicule_id}
    onChange={(val) => setFormData({ ...formData, vehicule_id: val })}
    renderOption={(opt) => (
        <div className="flex justify-between">
            <span>{opt.marque} {opt.modele}</span>
            <span className="text-cyan-400">{opt.prix_jour} DH/j</span>
        </div>
    )}
/>
```

### Props disponibles
- `options` - Liste des éléments (array)
- `value` - Valeur sélectionnée
- `onChange` - Callback de sélection
- `placeholder` - Texte par défaut
- `label` - Label du champ
- `required` - Champ obligatoire
- `disabled` - Désactiver le champ
- `renderOption` - Fonction de rendu personnalisé

---

## 🧪 Test

### Pour tester la fonctionnalité:

1. **Ouvrir** n'importe quel formulaire (Réservations, Contrats, etc.)
2. **Cliquer** sur un champ de sélection (Client, Véhicule, Agence)
3. **Tester** les raccourcis clavier:
   - Appuyez sur **↓** plusieurs fois
   - Appuyez sur **Enter** pour sélectionner
   - Appuyez sur **Escape** pour annuler
4. **Taper** du texte pour filtrer
5. **Vérifier** que l'élément sélectionné s'affiche correctement

---

## 🐛 Résolution de problèmes

### La liste ne s'ouvre pas
- Vérifiez que le champ n'est pas `disabled`
- Essayez de cliquer directement sur le champ

### La recherche ne fonctionne pas
- Vérifiez que les options ont un champ `label` ou `nom`
- Vérifiez la console pour d'éventuelles erreurs

### Les flèches ne fonctionnent pas
- Assurez-vous que la liste est ouverte
- Vérifiez que le focus est sur le champ de recherche

---

## ✅ Avantages

✨ **Expérience utilisateur améliorée**
- Navigation rapide au clavier
- Recherche instantanée
- Feedback visuel clair

🚀 **Performance**
- Filtrage côté client (rapide)
- Pas de requêtes serveur supplémentaires
- Optimisé pour grandes listes

♿ **Accessibilité**
- Support complet du clavier
- Attributs ARIA
- Compatible lecteurs d'écran

---

**Le composant est maintenant prêt à l'emploi dans toute l'application!** 🎉
