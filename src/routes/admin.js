const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Inventory = require('../models/Inventory')

const router = express.Router()

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ message: 'No autorizado' })
  const token = auth.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    if (payload.role !== 'admin') return res.status(403).json({ message: 'Acceso denegado' })
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

// GET /api/admin/users - listar usuarios
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).lean()
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Error listando usuarios' })
  }
})

// POST /api/admin/users - crear usuario
router.post('/users', authMiddleware, async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!email) return res.status(400).json({ message: 'Email requerido' })
    if (!password) return res.status(400).json({ message: 'Contraseña requerida' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(409).json({ message: 'El email ya está en uso' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash })
    res.status(201).json(user)
  } catch (err) {
    res.status(500).json({ message: 'Error creando usuario' })
  }
})

// DELETE /api/admin/users/:userId - eliminar usuario y sus inventarios
router.delete('/users/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params
    await User.findByIdAndDelete(userId)
    await Inventory.deleteMany({ user: userId })
    res.json({ message: 'Usuario eliminado' })
  } catch (err) {
    res.status(500).json({ message: 'Error eliminando usuario' })
  }
})

// GET /api/admin/inventories/:userId - inventario de un usuario
router.get('/inventories/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params
    const inventories = await Inventory.find({ user: userId }).lean()
    res.json(inventories)
  } catch (err) {
    res.status(500).json({ message: 'Error listando inventarios' })
  }
})

// POST /api/admin/inventories/:userId/items - agregar producto al inventario activo
router.post('/inventories/:userId/items', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params
    const { name, quantity } = req.body
    if (!name) return res.status(400).json({ message: 'Nombre de producto requerido' })
    const qty = Number(quantity) || 0

    let inv = await Inventory.findOne({ user: userId })
    if (!inv) {
      inv = await Inventory.create({ user: userId, items: [], createdAt: new Date() })
    }
    inv.items.push({ name, quantity: qty })
    await inv.save()
    res.status(201).json(inv)
  } catch (err) {
    res.status(500).json({ message: 'Error agregando producto' })
  }
})

// DELETE /api/admin/inventories/:userId/items - quitar producto por nombre
router.delete('/inventories/:userId/items', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params
    const { name } = req.body
    if (!name) return res.status(400).json({ message: 'Nombre de producto requerido' })

    const inv = await Inventory.findOne({ user: userId })
    if (!inv) return res.status(404).json({ message: 'Inventario no encontrado' })

    inv.items = (inv.items || []).filter(item => (item.name || item.productName || item.title || item.sku) !== name)
    await inv.save()
    res.json(inv)
  } catch (err) {
    res.status(500).json({ message: 'Error quitando producto' })
  }
})

module.exports = router