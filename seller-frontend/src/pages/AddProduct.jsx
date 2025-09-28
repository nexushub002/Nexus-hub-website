import React, { useState } from 'react'

const initialState = {
  name: '',
  category: '',
  description: '',
  price: '',
  priceRangeMin: '',
  priceRangeMax: '',
  moq: '',
  sampleAvailable: false,
  samplePrice: '',
  manufacturerId: '',
  hsCode: '',
  warranty: '',
  returnPolicy: '',
  customization: false,
  imagesCsv: '' // comma-separated URLs
}

const AddProduct = () => {
  const [form, setForm] = useState(initialState)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      const body = {
        name: form.name,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        priceRangeMin: Number(form.priceRangeMin) || undefined,
        priceRangeMax: Number(form.priceRangeMax) || undefined,
        moq: Number(form.moq),
        sampleAvailable: !!form.sampleAvailable,
        samplePrice: form.samplePrice ? Number(form.samplePrice) : undefined,
        manufacturerId: form.manufacturerId,
        hsCode: form.hsCode,
        warranty: form.warranty,
        returnPolicy: form.returnPolicy,
        customization: !!form.customization,
        images: form.imagesCsv.split(',').map(s => s.trim()).filter(Boolean)
      }

      const res = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create product')
      setMessage('Product created successfully')
      setForm(initialState)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Add Product</h1>
      {message && <div className='mb-4 text-sm'>{message}</div>}
      <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <input className='px-3 py-2 rounded border' name='name' placeholder='Name' value={form.name} onChange={handleChange} required />
        <input className='px-3 py-2 rounded border' name='category' placeholder='Category' value={form.category} onChange={handleChange} required />
        <input className='px-3 py-2 rounded border' name='price' placeholder='Price' type='number' value={form.price} onChange={handleChange} required />
        <input className='px-3 py-2 rounded border' name='moq' placeholder='MOQ' type='number' value={form.moq} onChange={handleChange} required />
        <input className='px-3 py-2 rounded border' name='priceRangeMin' placeholder='Price Range Min' type='number' value={form.priceRangeMin} onChange={handleChange} />
        <input className='px-3 py-2 rounded border' name='priceRangeMax' placeholder='Price Range Max' type='number' value={form.priceRangeMax} onChange={handleChange} />
        <input className='px-3 py-2 rounded border' name='samplePrice' placeholder='Sample Price' type='number' value={form.samplePrice} onChange={handleChange} />
        <input className='px-3 py-2 rounded border' name='manufacturerId' placeholder='Manufacturer (Seller) ID' value={form.manufacturerId} onChange={handleChange} required />
        <input className='px-3 py-2 rounded border md:col-span-2' name='hsCode' placeholder='HS Code' value={form.hsCode} onChange={handleChange} />
        <input className='px-3 py-2 rounded border md:col-span-2' name='warranty' placeholder='Warranty' value={form.warranty} onChange={handleChange} />
        <input className='px-3 py-2 rounded border md:col-span-2' name='returnPolicy' placeholder='Return Policy' value={form.returnPolicy} onChange={handleChange} />
        <textarea className='px-3 py-2 rounded border md:col-span-2' name='description' placeholder='Description' rows={4} value={form.description} onChange={handleChange} />
        <div className='flex items-center gap-4 md:col-span-2'>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' name='sampleAvailable' checked={form.sampleAvailable} onChange={handleChange} /> Sample Available
          </label>
          <label className='flex items-center gap-2 text-sm'>
            <input type='checkbox' name='customization' checked={form.customization} onChange={handleChange} /> Customization
          </label>
        </div>
        <input className='px-3 py-2 rounded border md:col-span-2' name='imagesCsv' placeholder='Image URLs (comma separated)' value={form.imagesCsv} onChange={handleChange} />

        <div className='md:col-span-2'>
          <button disabled={submitting} className='px-4 py-2 rounded bg-blue-600 text-white hover:opacity-90'>
            {submitting ? 'Submitting...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddProduct


