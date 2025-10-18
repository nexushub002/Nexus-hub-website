import React, { useEffect, useMemo, useState } from 'react';
import { useSeller } from '../context/SellerContext';

// Helpers for avatar
const getInitial = (s) => (s && s.trim() ? s.trim().charAt(0).toUpperCase() : 'S');
const stringToColor = (str = 'seller') => {
  let hash = 0; for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360; return `hsl(${h}, 70%, 45%)`;
};

const Field = ({ label, children, hint }) => (
  <div>
    <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>
    {children}
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${props.className || ''}`}
  />
);

const Card = ({ title, children, right }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="px-5 py-4 border-b flex items-center justify-between">
      <h3 className="font-semibold text-gray-800">{title}</h3>
      {right}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const SellerProfile = () => {
  const { seller, checkAuthStatus } = useSeller();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', businessName: '', gstNumber: '',
    companyAddress: { street: '', city: '', state: '', zipCode: '' }
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const displayName = useMemo(() => form.name || seller?.name || seller?.email || 'Seller', [form.name, seller]);

  useEffect(() => {
    const load = async () => {
      try {

        const url = `${import.meta.env.VITE_API_BASE_URL}/api/seller/auth/me`;

        const res = await fetch(url , { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const u = data.user || {};
          setForm({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            businessName: u.businessName || '',
            gstNumber: u.gstNumber || '',
            companyAddress: {
              street: u.companyAddress?.street || '',
              city: u.companyAddress?.city || '',
              state: u.companyAddress?.state || '',
              zipCode: u.companyAddress?.zipCode || ''
            }
          });
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('addr.')) {
      const key = name.split('.').pop();
      setForm((prev) => ({ ...prev, companyAddress: { ...prev.companyAddress, [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Full name is required';
    if (form.phone && !/^\d{10}$/.test(form.phone)) e.phone = 'Enter 10-digit phone number';
    if (form.gstNumber && !/^[0-9A-Z]{15}$/.test(form.gstNumber)) e.gstNumber = 'GST must be 15 chars (A-Z, 0-9)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validate()) return;
    setSaving(true);
    try {

      const url = `${import.meta.env.VITE_API_BASE_URL}/api/seller/auth/profile`;

      const res = await fetch(url , {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        setMessage('✅ Profile updated successfully');
        await checkAuthStatus();
      } else {
        setMessage(`❗ ${data.message || 'Failed to update profile'}`);
      }
    } catch (e) {
      console.error('Update failed', e);
      setMessage('❗ Network error while updating');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.08),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(168,85,247,0.08),transparent_40%)] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                 style={{ backgroundColor: stringToColor(displayName) }}>
              {getInitial(displayName)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Seller Profile</h1>
              <p className="text-gray-600">View and edit your personal and company information</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200">Secure</div>
            <div className="px-3 py-1 text-xs rounded-full bg-purple-50 text-purple-700 border border-purple-200">Editable</div>
          </div>
        </div>

        {/* Body */}
        {message && (
          <div className="text-sm px-4 py-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">{message}</div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(2)].map((_,i) => (
              <div key={i} className="h-64 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6">
            <Card title="Personal Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Full Name" hint={errors.name}>
                  <Input name="name" value={form.name} onChange={onChange} aria-invalid={!!errors.name} />
                </Field>
                <Field label="Email" hint="Your login email (readonly)">
                  <Input name="email" value={form.email} readOnly className="bg-gray-100 text-gray-500" />
                </Field>
                <Field label="Phone" hint={errors.phone || '10-digit number'}>
                  <Input name="phone" value={form.phone} onChange={onChange} aria-invalid={!!errors.phone} />
                </Field>
              </div>
            </Card>

            <Card title="Business Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Business Name">
                  <Input name="businessName" value={form.businessName} onChange={onChange} />
                </Field>
                <Field label="GST Number" hint={errors.gstNumber || '15 characters (A-Z, 0-9)'}>
                  <Input name="gstNumber" value={form.gstNumber} onChange={onChange} aria-invalid={!!errors.gstNumber} />
                </Field>
              </div>
            </Card>

            <Card title="Company Address" right={<span className="text-xs text-gray-500">Optional</span>}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="addr.street" value={form.companyAddress.street} onChange={onChange} placeholder="Street" />
                <Input name="addr.city" value={form.companyAddress.city} onChange={onChange} placeholder="City" />
                <Input name="addr.state" value={form.companyAddress.state} onChange={onChange} placeholder="State" />
                <Input name="addr.zipCode" value={form.companyAddress.zipCode} onChange={onChange} placeholder="ZIP Code" />
              </div>
            </Card>

            {/* Sticky Save Bar */}
            <div className="sticky bottom-4 z-10">
              <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur rounded-xl shadow border p-3 flex items-center justify-end gap-3">
                <button type="button" onClick={() => window.history.back()} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
