import { useEffect, useState } from 'react'
import { supabase } from '../supabase.js'
import { GAMES } from '../data/games.js'
import { resizeImageToBlob } from '../lib/imageResize.js'

const BANNER_SLOTS = [1, 2, 3, 4]
const GAME_LIST = Object.values(GAMES)

// Foti path storage husi public URL — atu bele apaga file tuan husi bucket
// 'media' bainhira admin troka ho imajen foun.
function storagePathFromUrl(url) {
  if (!url) return null
  const marker = '/media/'
  const idx = url.indexOf(marker)
  return idx >= 0 ? url.slice(idx + marker.length) : null
}

async function removeMediaFile(url) {
  const path = storagePathFromUrl(url)
  if (!path) return
  try {
    await supabase.storage.from('media').remove([path])
  } catch (err) {
    console.error('falha atu apaga file tuan', err)
  }
}

// Komprimí imajen antes upload (hases storage enxi lalais) — se kompresaun
// falha, uza file orijinal hanesan fallback.
async function uploadMediaFile(file, pathPrefix) {
  let uploadBlob = file
  let ext = 'jpg'
  let contentType = 'image/jpeg'
  try {
    uploadBlob = await resizeImageToBlob(file, 1600, 0.82)
  } catch (err) {
    console.error('resize falha, uza file orijinal', err)
    ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'jpg'
    contentType = file.type || 'image/jpeg'
    uploadBlob = file
  }
  const filePath = `${pathPrefix}-${Date.now()}.${ext}`
  const buffer = await uploadBlob.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, buffer, { upsert: false, contentType })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('media').getPublicUrl(filePath)
  return data.publicUrl
}

export default function VisualContentControl() {
  const [tab, setTab] = useState('banner') // 'banner' | 'game'
  const [banners, setBanners] = useState([])
  const [gameImages, setGameImages] = useState({})
  const [savingKey, setSavingKey] = useState(null)

  const loadBanners = async () => {
    const { data, error } = await supabase.from('portal_banners').select('slot, image_url').order('slot')
    if (!error && data) setBanners(data)
  }
  const loadGameImages = async () => {
    const { data, error } = await supabase.from('game_images').select('game, image_url')
    if (!error && data) {
      const map = {}
      data.forEach((row) => { map[row.game] = row.image_url })
      setGameImages(map)
    }
  }

  useEffect(() => {
    loadBanners()
    loadGameImages()
  }, [])

  const handleBannerUpload = async (slot, file) => {
    if (!file) return
    setSavingKey(`banner-${slot}`)
    try {
      const oldUrl = banners.find((b) => b.slot === slot)?.image_url
      const url = await uploadMediaFile(file, `banner-${slot}`)
      const { error } = await supabase.from('portal_banners').update({ image_url: url }).eq('slot', slot)
      if (error) throw error
      if (oldUrl) await removeMediaFile(oldUrl)
      loadBanners()
    } catch (err) {
      console.error(err)
      alert('Falha atu upload banner.')
    } finally {
      setSavingKey(null)
    }
  }

  const handleBannerRemove = async (slot) => {
    setSavingKey(`banner-${slot}`)
    try {
      const oldUrl = banners.find((b) => b.slot === slot)?.image_url
      const { error } = await supabase.from('portal_banners').update({ image_url: null }).eq('slot', slot)
      if (error) throw error
      if (oldUrl) await removeMediaFile(oldUrl)
      loadBanners()
    } finally {
      setSavingKey(null)
    }
  }

  const handleGameImageUpload = async (gameKey, file) => {
    if (!file) return
    setSavingKey(`game-${gameKey}`)
    try {
      const oldUrl = gameImages[gameKey]
      const url = await uploadMediaFile(file, `game-${gameKey}`)
      const { error } = await supabase.from('game_images').update({ image_url: url }).eq('game', gameKey)
      if (error) throw error
      if (oldUrl) await removeMediaFile(oldUrl)
      loadGameImages()
    } catch (err) {
      console.error(err)
      alert('Falha atu upload imajen.')
    } finally {
      setSavingKey(null)
    }
  }

  const handleGameImageRemove = async (gameKey) => {
    setSavingKey(`game-${gameKey}`)
    try {
      const oldUrl = gameImages[gameKey]
      const { error } = await supabase.from('game_images').update({ image_url: null }).eq('game', gameKey)
      if (error) throw error
      if (oldUrl) await removeMediaFile(oldUrl)
      loadGameImages()
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div>
      <div className="stock-game-tabs">
        <button className={tab === 'banner' ? 'active' : ''} onClick={() => setTab('banner')}>Banner Iklan</button>
        <button className={tab === 'game' ? 'active' : ''} onClick={() => setTab('game')}>Imajen Game</button>
      </div>

      {tab === 'banner' && (
        <div className="visual-item-list">
          {BANNER_SLOTS.map((slot) => {
            const banner = banners.find((b) => b.slot === slot)
            const saving = savingKey === `banner-${slot}`
            return (
              <div className="visual-item-row" key={slot}>
                <div className="visual-item-preview">
                  {banner?.image_url ? <img src={banner.image_url} alt={`Banner ${slot}`} /> : <span className="visual-item-empty">Vazia</span>}
                </div>
                <div className="visual-item-meta">
                  <div className="visual-item-title">Banner {slot}</div>
                  <div className="visual-item-actions">
                    <label className="btn btn-ghost btn-small">
                      {saving ? 'Haruka...' : 'Troka'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={saving}
                        onChange={(e) => handleBannerUpload(slot, e.target.files[0])} />
                    </label>
                    {banner?.image_url && (
                      <button className="link-btn danger" onClick={() => handleBannerRemove(slot)} disabled={saving}>Hasai</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'game' && (
        <div className="visual-item-list">
          {GAME_LIST.map((g) => {
            const saving = savingKey === `game-${g.key}`
            const imageUrl = gameImages[g.key]
            return (
              <div className="visual-item-row" key={g.key}>
                <div className="visual-item-preview">
                  {imageUrl ? <img src={imageUrl} alt={g.name} /> : <span className="visual-item-empty">Vazia</span>}
                </div>
                <div className="visual-item-meta">
                  <div className="visual-item-title">{g.name}</div>
                  <div className="visual-item-actions">
                    <label className="btn btn-ghost btn-small">
                      {saving ? 'Haruka...' : 'Troka'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={saving}
                        onChange={(e) => handleGameImageUpload(g.key, e.target.files[0])} />
                    </label>
                    {imageUrl && (
                      <button className="link-btn danger" onClick={() => handleGameImageRemove(g.key)} disabled={saving}>Hasai</button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
