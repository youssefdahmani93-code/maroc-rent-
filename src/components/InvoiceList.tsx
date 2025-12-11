import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Plus, Download, Eye, Edit,
  Trash2, Printer, RefreshCw, CheckCircle, XCircle,
  ArrowLeft, FileText, DollarSign, Receipt, Menu, ArrowDown
} from 'lucide-react';
import { formatCurrency, AGENCIES } from '../constants';
import {
  Invoice, InvoiceStatus, InvoiceItem, Client, Contract,
  InvoiceItem as InvoiceItemType // Use alias to avoid conflict
} from '../types';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client

type ViewMode = 'LIST' | 'FORM' | 'DETAILS';

export const InvoiceList: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');

  // Data States
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Settings (Mocked for now)
  const TAX_RATE = 0.20; // 20% TVA

  // Form State
  const initialFormState: Partial<Invoice> = {
    id: '',
    ref: `FACT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
    clientId: '',
    contractId: undefined,
    items: [{ description: 'Location de véhicule', quantity: 1, unitPrice: 0, total: 0 }],
    subTotal: 0,
    taxRate: TAX_RATE,
    taxAmount: 0,
    totalAmount: 0,
    paidAmount: 0,
    balance: 0,
    status: InvoiceStatus.PENDING,
    notes: ''
  };

  const [formData, setFormData] = useState<Partial<Invoice>>(initialFormState);


  // --- 1. Fetch Data ---
  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Get Invoices with Clients relation
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (id, full_name, address)
        `)
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      // 2. Get Clients (for Dropdown)
      const { data: clientsData } = await supabase.from('clients').select('id, full_name, address');

      // 3. Get Contracts (for linking)
      const { data: contractsData } = await supabase.from('contracts').select('id, contract_number');


      if (invoicesData) {
        const formattedInvoices: Invoice[] = invoicesData.map((inv: any) => ({
          ...inv,
          ref: inv.invoice_ref,
          date: inv.date,
          dueDate: inv.due_date,
          totalAmount: inv.total_amount,
          paidAmount: inv.paid_amount,
          balance: inv.balance,
          items: inv.items as InvoiceItemType[],
          // Client snapshot (from join)
          clientName: inv.clients?.full_name || 'Client Inconnu',
          clientAddress: inv.clients?.address || 'N/A'
        }));
        setInvoices(formattedInvoices);
      }

      if (clientsData) setClients(clientsData.map((c: any) => ({ ...c, fullName: c.full_name })));
      if (contractsData) setContracts(contractsData.map((c: any) => ({ ...c, contractNumber: c.contract_number })));

    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. Calculations ---

  const calculateTotals = (items: InvoiceItemType[], taxRate: number) => {
    const subTotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subTotal * taxRate;
    const totalAmount = subTotal + taxAmount;
    const balance = totalAmount - (formData.paidAmount || 0);

    setFormData(prev => ({
      ...prev,
      subTotal: parseFloat(subTotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
    }));
  };

  useEffect(() => {
    calculateTotals(formData.items as InvoiceItemType[], formData.taxRate || 0);
  }, [formData.items, formData.taxRate, formData.paidAmount]);


  // --- 3. Handle Save ---

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Get client info for immutable snapshot
    const client = clients.find(c => c.id === formData.clientId);
    if (!client) {
      alert('Veuillez sélectionner un client.');
      setLoading(false);
      return;
    }

    const payload = {
      invoice_ref: formData.ref,
      date: formData.date,
      due_date: formData.dueDate,
      status: formData.balance && formData.balance > 0 ? InvoiceStatus.PENDING : InvoiceStatus.PAID,
      contract_id: formData.contractId || null,
      client_id: formData.clientId,
      client_name: client.fullName, // Snapshot
      client_address: client.address, // Snapshot
      items: formData.items,
      sub_total: formData.subTotal,
      tax_rate: formData.taxRate,
      tax_amount: formData.taxAmount,
      total_amount: formData.totalAmount,
      paid_amount: formData.paidAmount,
      balance: formData.balance,
      notes: formData.notes
    };

    try {
      if (formData.id) {
        // Update
        const { error } = await supabase.from('invoices').update(payload).eq('id', formData.id);
        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase.from('invoices').insert([payload]);
        if (error) throw error;
      }

      await fetchData();
      setViewMode('LIST');
      setFormData(initialFormState);
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      alert('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  // --- 4. Handle Items/Client Changes (Form helpers) ---

  const handleItemChange = (index: number, field: keyof InvoiceItemType, value: string | number) => {
    const newItems = [...(formData.items as InvoiceItemType[])];
    const item = newItems[index];

    let numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;

    if (field === 'description') {
      item.description = value as string;
    } else if (field === 'quantity') {
      item.quantity = numericValue;
    } else if (field === 'unitPrice') {
      item.unitPrice = numericValue;
    }

    item.total = item.quantity * item.unitPrice;

    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    const newItems = [...(formData.items as InvoiceItemType[]), { description: '', quantity: 1, unitPrice: 0, total: 0 }];
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = (formData.items as InvoiceItemType[]).filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName: client?.fullName,
      clientAddress: client?.address
    }));
  };

  // --- 5. Render Helpers ---

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  // --- 6. Views ---

  const renderList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Facturation & Devis</h2>
        <button
          onClick={() => {
            setSelectedInvoice(null);
            setFormData(initialFormState);
            setViewMode('FORM');
          }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Facture
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par référence, client..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-4 py-2 bg-white"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">Tous les états</option>
          <option value="PAID">Payée</option>
          <option value="PENDING">En attente</option>
          <option value="OVERDUE">En retard</option>
        </select>
      </div>

      {loading && invoices.length === 0 ? (
        <div className="flex justify-center p-12"><RefreshCw className="animate-spin h-8 w-8 text-blue-600" /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Référence</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Date / Échéance</th>
                <th className="px-6 py-3 font-medium">Total (TTC)</th>
                <th className="px-6 py-3 font-medium">Solde dû</th>
                <th className="px-6 py-3 font-medium text-center">État</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices
                .filter(i => filterStatus === 'All' || i.status === filterStatus)
                .filter(i =>
                  i.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  i.ref?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-blue-600">
                      {invoice.ref}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{invoice.clientName}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <div>{invoice.date}</div>
                      <div className="text-red-500">Éch: {invoice.dueDate}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4 font-bold text-red-600">
                      {formatCurrency(invoice.balance)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedInvoice(invoice); setViewMode('DETAILS'); }} className="p-1 hover:bg-slate-200 rounded"><Eye className="h-4 w-4 text-slate-500" /></button>
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setFormData({
                              ...invoice,
                              clientId: invoice.client_id || invoice.clientId,
                              contractId: invoice.contract_id || invoice.contractId
                            });
                            setViewMode('FORM');
                          }}
                          className="p-1 hover:bg-slate-200 rounded"
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(invoice.id)} className="p-1 hover:bg-slate-200 rounded"><Trash2 className="h-4 w-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">{formData.id ? 'Modifier Facture' : 'Nouvelle Facture'}</h3>
        <button onClick={() => setViewMode('LIST')} className="text-slate-500 hover:text-slate-800">Annuler</button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Header Details */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Référence</label>
            <input type="text" className="w-full border rounded-lg p-2 bg-white font-mono" value={formData.ref} disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date d'émission</label>
            <input type="date" className="w-full border rounded-lg p-2" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date d'échéance</label>
            <input type="date" className="w-full border rounded-lg p-2" required value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">État</label>
            <select className="w-full border rounded-lg p-2" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as InvoiceStatus })}>
              {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Client & Contract Selection */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
            <select
              required
              className="w-full border rounded-lg p-2"
              value={formData.clientId}
              onChange={(e) => handleClientChange(e.target.value)}
            >
              <option value="">Sélectionner un client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lien vers Contrat (Optionnel)</label>
            <select
              className="w-full border rounded-lg p-2"
              value={formData.contractId || ''}
              onChange={(e) => setFormData({ ...formData, contractId: e.target.value || undefined })}
            >
              <option value="">Aucun contrat</option>
              {contracts.map(c => <option key={c.id} value={c.id}>{c.contractNumber}</option>)}
            </select>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3 text-left w-2/5">Description</th>
                <th className="p-3 text-right w-1/5">Qté</th>
                <th className="p-3 text-right w-1/5">Prix Unitaire (HT)</th>
                <th className="p-3 text-right w-1/5">Total (HT)</th>
                <th className="p-3 text-center w-12"></th>
              </tr>
            </thead>
            <tbody>
              {(formData.items as InvoiceItemType[]).map((item, index) => (
                <tr key={index} className="border-t hover:bg-slate-50">
                  <td className="p-3">
                    <input type="text" className="w-full border rounded-lg p-1" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} required />
                  </td>
                  <td className="p-3">
                    <input type="number" step="0.01" className="w-full border rounded-lg p-1 text-right" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} required />
                  </td>
                  <td className="p-3">
                    <input type="number" step="0.01" className="w-full border rounded-lg p-1 text-right" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} required />
                  </td>
                  <td className="p-3 text-right font-medium">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="p-3 text-center">
                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 border-t bg-slate-50">
            <button type="button" onClick={handleAddItem} className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
              <Plus className="h-4 w-4 mr-1" /> Ajouter Ligne
            </button>
          </div>
        </div>

        {/* Totals and Payment */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Conditions</label>
            <textarea className="w-full border rounded-lg p-2 h-32" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
          </div>
          <div>
            <div className="border rounded-lg p-4 bg-blue-50 space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Sous-total HT</span>
                <span className="font-medium">{formatCurrency(formData.subTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>TVA ({((formData.taxRate || 0) * 100).toFixed(0)}%)</span>
                <span className="font-medium">{formatCurrency(formData.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-blue-800 border-t pt-2">
                <span>Total TTC</span>
                <span>{formatCurrency(formData.totalAmount)}</span>
              </div>

              <div className="border-t pt-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Montant Payé (DH)</label>
                <input
                  type="number" step="0.01"
                  className="w-full border rounded-lg p-2 font-bold text-lg text-green-700"
                  value={formData.paidAmount}
                  onChange={e => setFormData({ ...formData, paidAmount: parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex justify-between text-lg font-bold text-red-700 border-t pt-2">
                <span>Solde Dû</span>
                <span>{formatCurrency(formData.balance)}</span>
              </div>
            </div>
          </div>
        </div>


        <div className="flex justify-end pt-4 border-t">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Enregistrement...' : 'Enregistrer la Facture'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderDetails = () => {
    if (!selectedInvoice) return null;
    const invoice = selectedInvoice;

    // Mock Agency Details
    const agencyDetails = {
      name: "GoRent Agence Centrale",
      address: "123, Rue Al Massira, Casablanca",
      phone: "+212 6 XX XX XX XX",
      email: "contact@gorenta.ma",
      ICE: "0000000000"
    };

    return (
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl border border-slate-200 overflow-hidden">
        {/* Top Bar for Actions */}
        <div className="flex justify-between items-center p-4 border-b bg-slate-50 print:hidden">
          <button onClick={() => setViewMode('LIST')} className="flex items-center text-slate-500 hover:text-slate-800 text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </button>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex items-center bg-white border border-slate-300 hover:bg-slate-100 px-3 py-1 rounded text-sm">
              <Printer className="mr-2 h-4 w-4" /> Imprimer
            </button>
            {/* Add Download PDF logic here later */}
            <button className="flex items-center bg-white border border-slate-300 hover:bg-slate-100 px-3 py-1 rounded text-sm">
              <Download className="mr-2 h-4 w-4" /> Exporter
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="flex justify-between">
            <div>
              <div className="text-3xl font-extrabold text-blue-600">GoRent</div>
              <p className="text-xs text-slate-500 mt-1">{agencyDetails.address}</p>
              <p className="text-xs text-slate-500">ICE: {agencyDetails.ICE}</p>
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold uppercase text-slate-800">Facture</h1>
              <p className="text-sm text-slate-600 mt-1">N° de Réf: <span className="font-mono font-bold text-blue-600">{invoice.ref}</span></p>
              <p className="text-sm text-slate-600">Date: {invoice.date}</p>
            </div>
          </div>

          {/* Client & Dates */}
          <div className="grid grid-cols-2 gap-4 border-t border-b py-4">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 mb-1">Facturé à:</p>
              <p className="font-bold text-lg text-slate-900">{invoice.clientName}</p>
              <p className="text-sm text-slate-600">{invoice.clientAddress}</p>
              {invoice.contractId && (
                <p className="text-xs text-slate-400 mt-2">Contrat lié: {contracts.find(c => c.id === invoice.contractId)?.contractNumber || invoice.contractId}</p>
              )}
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm font-medium text-slate-700">Date d'échéance: <span className="font-bold text-red-600">{invoice.dueDate}</span></p>
              <p className="text-sm font-medium text-slate-700">État:
                <span className={`px-2 py-0.5 ml-2 rounded-full text-xs font-bold ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-right">Qté</th>
                  <th className="p-3 text-right">P.U. HT</th>
                  <th className="p-3 text-right">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-3 font-medium text-slate-800">{item.description}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-3 text-right font-bold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Sous-total (HT)</span>
                  <span>{formatCurrency(invoice.subTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600 border-b pb-2">
                  <span>TVA ({((invoice.taxRate || 0) * 100).toFixed(0)}%)</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-800 pt-2">
                  <span>Total TTC</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 pt-1 border-t border-slate-100">
                  <span>Déjà payé</span>
                  <span>{formatCurrency(invoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-red-600 pt-1 border-t border-slate-100">
                  <span>Solde dû</span>
                  <span>{formatCurrency(invoice.balance)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notes & Signature */}
          <div className="border-t-2 border-slate-100 pt-6 flex justify-between items-end">
            <div className="text-xs text-slate-400 max-w-md">
              {invoice.notes && (
                <p className="font-bold mb-1 text-slate-600">Notes:</p>
              )}
              <p className='mt-2'>Paiement dû à la date d'échéance. Merci de votre confiance.</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-slate-500">Cachet et Signature Agence</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette facture ?')) {
      try {
        const { error } = await supabase.from('invoices').delete().eq('id', id);
        if (error) throw error;
        setInvoices(invoices.filter(i => i.id !== id));
      } catch (error) {
        console.error(error);
        alert('Erreur de suppression');
      }
    }
  };


  return (
    <div>
      {viewMode === 'LIST' && renderList()}
      {viewMode === 'FORM' && renderForm()}
      {viewMode === 'DETAILS' && renderDetails()}
    </div>
  );
};