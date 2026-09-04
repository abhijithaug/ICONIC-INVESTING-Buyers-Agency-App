import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  Calendar, 
  User, 
  ShieldCheck, 
  FileCheck, 
  DollarSign, 
  Building2, 
  UserCheck, 
  FolderOpen, 
  Plus, 
  X, 
  Check,
  AlertTriangle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { ClientDocument, DocumentCategory, ClientProfile, AuthUser, REQUIRED_DOCUMENT_CATEGORIES } from '../../types';

interface ClientProfileDocumentUploadProps {
  client: ClientProfile;
  currentUser: AuthUser;
  documents: ClientDocument[];
  onAddDocument: (doc: ClientDocument) => void;
  onDeleteDocument?: (docId: string) => void;
  className?: string;
  title?: string;
  description?: string;
}

export const triggerDocumentDownload = (doc: ClientDocument) => {
  const content = `=====================================================
ICONIC INVESTING - CLIENT PROFILE DOCUMENT VAULT
Document Title: ${doc.title}
File Name: ${doc.fileName}
Category: ${doc.category}
Uploaded By: ${doc.uploadedBy.toUpperCase()} (${doc.uploadedByName})
Upload Date: ${doc.uploadedAt}
Status: ${doc.status}
Client: ${doc.clientName}
${doc.propertyAddress ? `Property Address: ${doc.propertyAddress}\n` : ''}${doc.notes ? `Notes / Special Conditions: ${doc.notes}\n` : ''}=====================================================
Verification: Australian Property Conveyancing & Due Diligence Standard
Certified in Iconic Investing Client Vault.
`;
  const blob = new Blob([content], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const ClientProfileDocumentUpload: React.FC<ClientProfileDocumentUploadProps> = ({
  client,
  currentUser,
  documents,
  onAddDocument,
  onDeleteDocument,
  className = '',
  title = 'Client Profile Documents & File Vault',
  description = 'Upload and manage contracts, building & pest reports, payment receipts, finance records, and ID verification.'
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [deleteConfirmDocId, setDeleteConfirmDocId] = useState<string | null>(null);
  const [downloadSuccessDocId, setDownloadSuccessDocId] = useState<string | null>(null);

  // Upload Form State
  const [docCategory, setDocCategory] = useState<DocumentCategory>('Contracts');
  const [docTitle, setDocTitle] = useState('');
  const [customFileName, setCustomFileName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter documents strictly for this client
  const clientDocs = documents.filter(d => d.clientId === client.id);

  const filteredDocs = clientDocs.filter(d => {
    // Category filter
    if (selectedCategoryFilter !== 'All') {
      if (d.category !== selectedCategoryFilter) {
        // Handle legacy alias mappings if any
        if (selectedCategoryFilter === 'Contracts' && d.category === 'Contract of Sale') return true;
        if (selectedCategoryFilter === 'Building & Pest Reports' && d.category === 'Building & Pest') return true;
        if (selectedCategoryFilter === 'Finance Documents' && d.category === 'Pre-Approval & Finance') return true;
        if (selectedCategoryFilter === 'ID Verification' && d.category === 'Proof of ID & Entity') return true;
        if (selectedCategoryFilter === 'Other' && (d.category === 'Due Diligence & Title' || d.category === 'Settlement & PEXA')) return true;
        return false;
      }
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.fileName.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.uploadedByName.toLowerCase().includes(q) ||
        (d.propertyAddress && d.propertyAddress.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setCustomFileName(file.name);
    if (!docTitle) {
      // Auto generate pleasant title from file name
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      setDocTitle(cleanTitle);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() && !customFileName.trim()) return;

    const formattedFileName = customFileName.trim() 
      ? (customFileName.includes('.') ? customFileName.trim() : `${customFileName.trim()}.pdf`)
      : `${docTitle.trim().replace(/\s+/g, '_')}.pdf`;

    const finalTitle = docTitle.trim() || customFileName.replace(/\.[^/.]+$/, '');
    
    // Format size
    const sizeStr = selectedFile 
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : '1.4 MB';

    // Format current local date: YYYY-MM-DD
    const todayStr = new Date().toISOString().split('T')[0];

    const newDoc: ClientDocument = {
      id: `doc-${Date.now()}`,
      clientId: client.id,
      clientName: client.fullName || client.name,
      title: finalTitle,
      category: docCategory,
      fileName: formattedFileName,
      fileSize: sizeStr,
      fileType: selectedFile?.type || 'application/pdf',
      uploadedBy: currentUser.role === 'admin' ? 'admin' : 'client',
      uploadedByName: currentUser.name || (currentUser.role === 'admin' ? 'Damian Sterling (Buyers Advocate)' : client.name),
      uploadedAt: todayStr,
      propertyAddress: propertyAddress.trim() || undefined,
      status: 'Verified',
      downloadUrl: '#',
      notes: docNotes.trim() || undefined
    };

    onAddDocument(newDoc);
    setUploadSuccessMsg(true);

    // Reset Form
    setDocTitle('');
    setCustomFileName('');
    setPropertyAddress('');
    setDocNotes('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => {
      setUploadSuccessMsg(false);
      setIsUploadModalOpen(false);
    }, 1200);
  };

  const handleDownloadDoc = (doc: ClientDocument) => {
    triggerDocumentDownload(doc);
    setDownloadSuccessDocId(doc.id);
    setTimeout(() => setDownloadSuccessDocId(null), 2500);
  };

  const handleDeleteDoc = (docId: string) => {
    if (!isAdmin) return; // Guard: Clients cannot delete documents
    if (onDeleteDocument) {
      onDeleteDocument(docId);
    }
    setDeleteConfirmDocId(null);
  };

  const getCategoryBadgeColor = (cat: DocumentCategory) => {
    switch (cat) {
      case 'Contracts':
      case 'Contract of Sale':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Building & Pest Reports':
      case 'Building & Pest':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Payment Receipts':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Finance Documents':
      case 'Pre-Approval & Finance':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ID Verification':
      case 'Proof of ID & Entity':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getCategoryIcon = (cat: DocumentCategory) => {
    switch (cat) {
      case 'Contracts':
      case 'Contract of Sale':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'Building & Pest Reports':
      case 'Building & Pest':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case 'Payment Receipts':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'Finance Documents':
      case 'Pre-Approval & Finance':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'ID Verification':
      case 'Proof of ID & Entity':
        return <UserCheck className="w-4 h-4 text-cyan-600" />;
      default:
        return <FolderOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5 ${className}`}>
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#1A3A5C] text-[#B8960C] flex items-center justify-center font-bold shadow-xs">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif-heading tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-500">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Action Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="client-profile-open-upload-btn"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#1A3A5C] hover:bg-[#234e7a] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#B8960C]" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Role Notice Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <span className="font-semibold text-slate-900">Current Session:</span>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#1A3A5C] text-white">
            {isAdmin ? 'Admin View (Damian Sterling)' : `Client Portal (${currentUser.name})`}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">
            {isAdmin 
              ? 'Full Access: Upload, Download & Admin Deletion privileges enabled.' 
              : 'Read-Only Security: Upload & Download enabled. Deletion is restricted to agency admins.'}
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-500 font-semibold">
          {clientDocs.length} Total Document(s) on File
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              selectedCategoryFilter === 'All'
                ? 'bg-[#1A3A5C] text-white font-bold shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Categories ({clientDocs.length})
          </button>
          {REQUIRED_DOCUMENT_CATEGORIES.map(cat => {
            const count = clientDocs.filter(d => {
              if (d.category === cat) return true;
              if (cat === 'Contracts' && d.category === 'Contract of Sale') return true;
              if (cat === 'Building & Pest Reports' && d.category === 'Building & Pest') return true;
              if (cat === 'Finance Documents' && d.category === 'Pre-Approval & Finance') return true;
              if (cat === 'ID Verification' && d.category === 'Proof of ID & Entity') return true;
              if (cat === 'Other' && (d.category === 'Due Diligence & Title' || d.category === 'Settlement & PEXA')) return true;
              return false;
            }).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#1A3A5C] text-white font-bold shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategoryFilter === cat ? 'bg-[#B8960C] text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by file name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-[#1A3A5C]"
          />
        </div>
      </div>

      {/* DOCUMENT LIST TABLE */}
      {filteredDocs.length === 0 ? (
        <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 mx-auto flex items-center justify-center">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-700">No documents found in this view</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Upload contracts, B&P reports, payment receipts, or finance documents for this investor profile.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-[#1A3A5C] hover:bg-[#234e7a] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs transition"
          >
            <Upload className="w-3.5 h-3.5 text-[#B8960C]" />
            <span>Upload First File</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">File Name & Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Upload Date</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => {
                const isDeleting = deleteConfirmDocId === doc.id;
                const isDownloaded = downloadSuccessDocId === doc.id;

                return (
                  <tr 
                    key={doc.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* 1. File Name & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                          {getCategoryIcon(doc.category)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-mono font-semibold text-slate-900 text-xs truncate max-w-[280px] sm:max-w-xs" title={doc.fileName}>
                            {doc.fileName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[280px] sm:max-w-xs mt-0.5" title={doc.title}>
                            {doc.title}
                          </div>
                          {doc.propertyAddress && (
                            <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                              📍 {doc.propertyAddress}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${getCategoryBadgeColor(doc.category)} inline-block`}>
                        {doc.category}
                      </span>
                    </td>

                    {/* 3. Upload Date */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.uploadedAt}</span>
                      </div>
                    </td>

                    {/* 4. Uploaded By (Admin or Client) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {doc.uploadedBy === 'admin' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1A3A5C] text-white flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#B8960C]" />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                            <User className="w-3 h-3 text-amber-700" />
                            <span>Client</span>
                          </span>
                        )}
                        <span className="text-[11px] text-slate-600 truncate max-w-[130px]" title={doc.uploadedByName}>
                          {doc.uploadedByName}
                        </span>
                      </div>
                    </td>

                    {/* 5. Download Button & Admin Delete */}
                    <td className="py-3 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Download Button (Visible to both Admins and Clients) */}
                        <button
                          type="button"
                          id={`download-doc-${doc.id}`}
                          onClick={() => handleDownloadDoc(doc)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                            isDownloaded
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white hover:bg-slate-100 text-[#1A3A5C] border-slate-200 shadow-2xs'
                          }`}
                          title={`Download ${doc.fileName}`}
                        >
                          {isDownloaded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Downloaded</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5 text-[#B8960C]" />
                              <span>Download</span>
                            </>
                          )}
                        </button>

                        {/* Admin Delete Action (STRICTLY ADMIN ONLY) */}
                        {isAdmin && (
                          <>
                            {isDeleting ? (
                              <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                                <span className="text-[10px] text-rose-700 font-bold px-1">Delete?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDoc(doc.id)}
                                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold cursor-pointer"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmDocId(null)}
                                  className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 text-[10px] cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                id={`delete-doc-${doc.id}`}
                                onClick={() => setDeleteConfirmDocId(doc.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete document (Admin Only)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#1A3A5C] to-[#254f7a] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#B8960C]">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Upload Client Document</h3>
                  <p className="text-xs text-slate-200">
                    Client: <span className="font-semibold text-amber-300">{client.fullName || client.name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs">
              
              {/* Category Selector (Strictly the 6 requested categories) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Document Category <span className="text-rose-500">*</span>
                </label>
                <select
                  id="client-profile-doc-category-select"
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#1A3A5C]"
                  required
                >
                  {REQUIRED_DOCUMENT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Select one of the 6 official investor record categories.
                </p>
              </div>

              {/* Drag & Drop File Target */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Select File from Computer
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                    isDragOver 
                      ? 'border-[#B8960C] bg-amber-50/50' 
                      : selectedFile
                        ? 'border-emerald-400 bg-emerald-50/40'
                        : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-800 font-semibold">
                      <FileCheck className="w-5 h-5 text-emerald-600" />
                      <span className="truncate max-w-xs">{selectedFile.name}</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 mx-auto text-slate-400" />
                      <p className="text-xs font-semibold text-slate-700">
                        Drag & drop your file here, or <span className="text-[#1A3A5C] underline">browse files</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Supports PDF, Word (DOCX), Excel (XLSX), JPG, PNG up to 25MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* File Name & Title Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    File Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="client-profile-doc-filename-input"
                    placeholder="e.g. Contract_Sale_Kallangur.pdf"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-hidden focus:border-[#1A3A5C]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="client-profile-doc-title-input"
                    placeholder="e.g. Executed Contract of Sale"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-xs focus:bg-white focus:outline-hidden focus:border-[#1A3A5C]"
                    required
                  />
                </div>
              </div>

              {/* Property Address & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Associated Property (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 42 Bunya Pine Cct, Kallangur"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-[#1A3A5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Uploader Identity
                  </label>
                  <div className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center justify-between font-semibold">
                    <span>{currentUser.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1A3A5C] text-white">
                      {isAdmin ? 'Admin' : 'Client'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Special Conditions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Subject to finance clause due 15 Sep, deposit lodged in conveyancer trust account."
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:border-[#1A3A5C]"
                />
              </div>

              {/* Success Notification inside modal */}
              {uploadSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Document verified and saved to client record!</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="client-profile-submit-upload-btn"
                  className="px-5 py-2 rounded-xl bg-[#1A3A5C] hover:bg-[#234e7a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#B8960C]" />
                  <span>Upload to Record</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
