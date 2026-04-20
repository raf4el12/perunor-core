export const typeDefs = `#graphql
  type Query {
    me: Usuario
    health: String!
    articulos(page: Int, limit: Int, search: String): ArticuloPaginado!
    articulo(id: ID!): Articulo
    almacenes(page: Int, limit: Int, search: String): AlmacenPaginado!
    almacen(id: ID!): Almacen
    procesos(page: Int, limit: Int, search: String): ProcesoPaginado!
    proceso(id: ID!): Proceso
    proveedores(page: Int, limit: Int, search: String): ProveedorPaginado!
    proveedor(id: ID!): Proveedor
    clientes(page: Int, limit: Int, search: String): ClientePaginado!
    cliente(id: ID!): Cliente
    conductores(page: Int, limit: Int, search: String): ConductorPaginado!
    conductor(id: ID!): Conductor
    usuarios(page: Int, limit: Int, search: String): UsuarioPaginado!
    usuario(id: ID!): Usuario
  }

  type Mutation {
    requestOtp(email: String!): RequestOtpResult!
    verifyOtp(email: String!, code: String!): AuthResult!
    crearArticulo(input: CrearArticuloInput!): Articulo!
    actualizarArticulo(id: ID!, input: ActualizarArticuloInput!): Articulo!
    toggleArticulo(id: ID!): Articulo!
    crearAlmacen(input: CrearAlmacenInput!): Almacen!
    actualizarAlmacen(id: ID!, input: ActualizarAlmacenInput!): Almacen!
    toggleAlmacen(id: ID!): Almacen!
    crearProceso(input: CrearProcesoInput!): Proceso!
    actualizarProceso(id: ID!, input: ActualizarProcesoInput!): Proceso!
    toggleProceso(id: ID!): Proceso!
    crearProveedor(input: CrearProveedorInput!): Proveedor!
    actualizarProveedor(id: ID!, input: ActualizarProveedorInput!): Proveedor!
    toggleProveedor(id: ID!): Proveedor!
    crearCliente(input: CrearClienteInput!): Cliente!
    actualizarCliente(id: ID!, input: ActualizarClienteInput!): Cliente!
    toggleCliente(id: ID!): Cliente!
    crearConductor(input: CrearConductorInput!): Conductor!
    actualizarConductor(id: ID!, input: ActualizarConductorInput!): Conductor!
    toggleConductor(id: ID!): Conductor!
    crearUsuario(input: CrearUsuarioInput!): Usuario!
    actualizarUsuario(id: ID!, input: ActualizarUsuarioInput!): Usuario!
    toggleUsuario(id: ID!): Usuario!
  }

  type Usuario {
    id: ID!
    nombre: String!
    email: String!
    rol: Rol!
    activo: Boolean!
    creadoEn: String!
  }

  type RequestOtpResult {
    ok: Boolean!
    message: String!
  }

  type AuthResult {
    ok: Boolean!
    token: String
    usuario: Usuario
    message: String
  }

  enum Rol {
    admin
    operador
  }

  type Articulo {
    id: ID!
    codigo: String!
    nombre: String!
    descripcion: String
    unidadMedida: String!
    categoria: CategoriaArticulo!
    activo: Boolean!
    creadoEn: String!
    actualizadoEn: String!
  }

  type ArticuloPaginado {
    items: [Articulo!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  enum CategoriaArticulo {
    materia_prima
    insumo
    producto_terminado
    empaque
  }

  input CrearArticuloInput {
    codigo: String!
    nombre: String!
    descripcion: String
    unidadMedida: String!
    categoria: CategoriaArticulo!
  }

  input ActualizarArticuloInput {
    codigo: String
    nombre: String
    descripcion: String
    unidadMedida: String
    categoria: CategoriaArticulo
  }

  type Almacen {
    id: ID!
    nombre: String!
    ubicacion: String
    activo: Boolean!
    creadoEn: String!
    actualizadoEn: String!
  }

  type AlmacenPaginado {
    items: [Almacen!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CrearAlmacenInput {
    nombre: String!
    ubicacion: String
  }

  input ActualizarAlmacenInput {
    nombre: String
    ubicacion: String
  }

  type Proceso {
    id: ID!
    nombre: String!
    descripcion: String
    activo: Boolean!
    creadoEn: String!
    actualizadoEn: String!
  }

  type ProcesoPaginado {
    items: [Proceso!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CrearProcesoInput {
    nombre: String!
    descripcion: String
  }

  input ActualizarProcesoInput {
    nombre: String
    descripcion: String
  }

  type Proveedor {
    id: ID!
    ruc: String!
    nombre: String!
    contacto: String
    activo: Boolean!
    creadoEn: String!
    actualizadoEn: String!
  }

  type ProveedorPaginado {
    items: [Proveedor!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CrearProveedorInput {
    ruc: String!
    nombre: String!
    contacto: String
  }

  input ActualizarProveedorInput {
    ruc: String
    nombre: String
    contacto: String
  }

  type Cliente {
    id: ID!
    ruc: String!
    nombre: String!
    contacto: String
    activo: Boolean!
    creadoEn: String!
    actualizadoEn: String!
  }

  type ClientePaginado {
    items: [Cliente!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CrearClienteInput {
    ruc: String!
    nombre: String!
    contacto: String
  }

  input ActualizarClienteInput {
    ruc: String
    nombre: String
    contacto: String
  }

  type Conductor {
    id: ID!
    dni: String!
    nombres: String!
    apellidos: String!
    licencia: String
    telefono: String
    placaVehiculo: String
    activo: Boolean!
    creadoEn: String!
    actualizadoEn: String!
  }

  type ConductorPaginado {
    items: [Conductor!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CrearConductorInput {
    dni: String!
    nombres: String!
    apellidos: String!
    licencia: String
    telefono: String
    placaVehiculo: String
  }

  input ActualizarConductorInput {
    dni: String
    nombres: String
    apellidos: String
    licencia: String
    telefono: String
    placaVehiculo: String
  }

  type UsuarioPaginado {
    items: [Usuario!]!
    total: Int!
    page: Int!
    limit: Int!
  }

  input CrearUsuarioInput {
    nombre: String!
    email: String!
    rol: Rol!
  }

  input ActualizarUsuarioInput {
    nombre: String
    email: String
    rol: Rol
  }
`;
