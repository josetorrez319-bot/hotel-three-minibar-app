"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const productos = [
  "Semillas",
  "Chips Coco",
  "Chips Mango",
  "Imperial",
  "Bavaria",
  "S. Pellegrino",
  "Limonada",
  "Cápsulas de Café",
  "Café Descafeinado",
  "Chocolates",
  "Galleta",
  "Vino Blanco",
  "Vino Tinto",
  "Kit Dental",
  "Kit de Afeitar",
  "Vanity Kit",
  "Gorra de Baño",
  "Esponja",
];

const villas = Array.from(
  { length: 12 },
  (_, index) => `Villa ${String(index + 1).padStart(2, "0")}`
);

type Item = {
  producto: string;
  cantidad: number;
};

type Reporte = {
  id?: number;
  fecha: string;
  villa: string;
  colaborador: string;
  items: Item[];
};

export default function Home() {
  const [vista, setVista] = useState<"registro" | "reportes">("registro");

  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [villa, setVilla] = useState("Villa 01");
  const [colaborador, setColaborador] = useState("Katherine");
  const [producto, setProducto] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const [items, setItems] = useState<Item[]>([]);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);

  // =========================================================
  // FECHAS DE HOY Y AYER
  // =========================================================

  function obtenerFechaLocal(fechaBase: Date) {
    const year = fechaBase.getFullYear();
    const month = String(fechaBase.getMonth() + 1).padStart(2, "0");
    const day = String(fechaBase.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function obtenerHoyYAyer() {
    const hoy = new Date();

    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    return {
      hoy: obtenerFechaLocal(hoy),
      ayer: obtenerFechaLocal(ayer),
    };
  }

  // =========================================================
  // CARGAR REPORTES DESDE SUPABASE
  // =========================================================

  async function cargarReportes() {
    setCargando(true);

    const { hoy, ayer } = obtenerHoyYAyer();

    const { data, error } = await supabase
      .from("reportes")
      .select("*")
      .gte("fecha", ayer)
      .lte("fecha", hoy)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error cargando reportes:", error);
      setCargando(false);
      return;
    }

    const reportesFormateados: Reporte[] = (data || []).map((reporte) => ({
      id: reporte.id,
      fecha: reporte.fecha,
      villa: reporte.villa,
      colaborador: reporte.colaborador,
      items: reporte.productos || [],
    }));

    setReportes(reportesFormateados);
    setCargando(false);
  }

  useEffect(() => {
    cargarReportes();
  }, []);

  // =========================================================
  // AGREGAR PRODUCTO
  // =========================================================

  function agregarProducto() {
    if (!producto || cantidad < 1) return;

    setItems((actuales) => [
      ...actuales,
      {
        producto,
        cantidad,
      },
    ]);

    setProducto("");
    setCantidad(1);
  }

  // =========================================================
  // ELIMINAR PRODUCTO
  // =========================================================

  function eliminarProducto(index: number) {
    setItems((actuales) =>
      actuales.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  // =========================================================
  // GUARDAR REPORTE EN SUPABASE
  // =========================================================

  async function guardarReporte() {
    if (items.length === 0 || guardando) return;

    setGuardando(true);

    const { error } = await supabase.from("reportes").insert([
      {
        fecha,
        villa,
        colaborador,
        productos: items,
      },
    ]);

    if (error) {
      console.error("Error al guardar:", error);
      alert("No se pudo guardar el reporte.");
      setGuardando(false);
      return;
    }

    setItems([]);
    setProducto("");
    setCantidad(1);

    await cargarReportes();

    setVista("reportes");
    setGuardando(false);
  }

  // =========================================================
  // CAMBIAR PESTAÑA
  // =========================================================

  async function abrirReportes() {
    setVista("reportes");
    await cargarReportes();
  }

  return (
    <main className="min-h-screen bg-[#f7f4ec]">
      <div className="mx-auto w-full max-w-[820px] overflow-hidden bg-[#fffdf8] shadow-xl">

        {/* ================================================= */}
        {/* ENCABEZADO */}
        {/* ================================================= */}

        <header className="relative overflow-hidden border-b border-[#c4932f] bg-[#f8f3e8] px-5 py-6">
          {/* Decoración */}
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border border-[#c4932f]/15" />
          <div className="pointer-events-none absolute right-3 top-16 h-40 w-40 rounded-full border border-[#c4932f]/10" />

          <div className="relative flex items-center justify-center gap-5">

            {/* LOGO */}

            <div className="flex w-[115px] items-center justify-center">
              <Image
                src="/logo.png"
                alt="Hotel Three Sixty Ojochal"
                width={115}
                height={115}
                className="h-auto w-[105px] object-contain"
                priority
              />
            </div>

            {/* LÍNEA */}

            <div className="h-28 w-px bg-[#c4932f]" />

            {/* MINIBAR */}

            <div className="flex flex-1 flex-col items-center justify-center">

              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-10 bg-[#c4932f]" />

                <span className="text-lg text-[#c4932f]">
                  ✦
                </span>

                <div className="h-px w-10 bg-[#c4932f]" />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px w-7 bg-[#c4932f]" />

                <h1 className="text-[clamp(2rem,7vw,3.4rem)] font-medium tracking-[0.12em] text-[#174f3d]">
                  MINIBAR
                </h1>

                <div className="h-px w-7 bg-[#c4932f]" />
              </div>

              <p className="mt-2 text-center text-[11px] tracking-[0.32em] text-[#b9852c] sm:text-sm">
                HOTEL THREE SIXTY
              </p>
            </div>
          </div>
        </header>

        {/* ================================================= */}
        {/* PESTAÑAS */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 border-b border-[#ddd8ce] bg-white">

          <button
            type="button"
            onClick={() => setVista("registro")}
            className={`relative px-3 py-4 text-base font-bold transition ${
              vista === "registro"
                ? "text-[#174f3d]"
                : "text-gray-500"
            }`}
          >
            <span className="mr-2 text-[#c4932f]">▣</span>
            Nuevo registro

            {vista === "registro" && (
              <span className="absolute bottom-0 left-0 h-[4px] w-full bg-[#174f3d]" />
            )}
          </button>

          <button
            type="button"
            onClick={abrirReportes}
            className={`relative px-3 py-4 text-base font-bold transition ${
              vista === "reportes"
                ? "text-[#174f3d]"
                : "text-gray-500"
            }`}
          >
            <span className="mr-2">▥</span>
            Reportes

            {vista === "reportes" && (
              <span className="absolute bottom-0 left-0 h-[4px] w-full bg-[#174f3d]" />
            )}
          </button>
        </div>

        {/* ================================================= */}
        {/* NUEVO REGISTRO */}
        {/* ================================================= */}

        {vista === "registro" && (
          <section className="p-4 sm:p-5">

            <div className="w-full overflow-hidden rounded-[28px] border border-[#e2ddd3] bg-white p-4 shadow-sm sm:p-5">

              {/* FECHA */}

              <div className="w-full overflow-hidden">
                <label className="mb-2 block text-sm font-bold text-[#174f3d] sm:text-base">
                  Fecha
                </label>

                <input
                 type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="
                    block
                    h-[54px]
                    w-full
                    min-w-0
                    max-w-full
                    box-border
                    appearance-none
                    rounded-2xl
                    border
                    border-[#d8d2c7]
                    bg-[#fffdf9]
                    px-4
                    text-base
                    text-gray-800
                    outline-none
                    focus:border-[#c4932f]
                  "
                />
              </div>

              {/* VILLA + COLABORADOR */}

              <div className="mt-4 grid grid-cols-2 gap-3">

                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-bold text-[#174f3d] sm:text-base">
                    Villa
                  </label>

                  <select
                    value={villa}
                    onChange={(e) => setVilla(e.target.value)}
                    className="h-[54px] w-full min-w-0 rounded-2xl border border-[#d8d2c7] bg-[#fffdf9] px-3 text-base outline-none focus:border-[#c4932f]"
                  >
                    {villas.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-bold text-[#174f3d] sm:text-base">
                    Colaborador
                  </label>

                  <select
                    value={colaborador}
                    onChange={(e) => setColaborador(e.target.value)}
                    className="h-[54px] w-full min-w-0 rounded-2xl border border-[#d8d2c7] bg-[#fffdf9] px-3 text-base outline-none focus:border-[#c4932f]"
                  >
                    <option value="Katherine">
                      Katherine
                    </option>

                    <option value="Laura">
                      Laura
                    </option>
                  </select>
                </div>
              </div>

              {/* PRODUCTO + CANTIDAD */}

              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_105px] gap-3">

                <div className="min-w-0">
                  <label className="mb-2 block text-sm font-bold text-[#174f3d] sm:text-base">
                    Producto
                  </label>

                  <select
                    value={producto}
                    onChange={(e) => setProducto(e.target.value)}
                    className="h-[54px] w-full min-w-0 rounded-2xl border border-[#d8d2c7] bg-[#fffdf9] px-3 text-base outline-none focus:border-[#c4932f]"
                  >
                    <option value="">
                      Seleccionar producto
                    </option>

                    {productos.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#174f3d] sm:text-base">
                    Cantidad
                  </label>

                  <div className="flex h-[54px] items-center justify-between rounded-2xl border border-[#d8d2c7] bg-[#fffdf9] px-2">

                    <button
                      type="button"
                      onClick={() =>
                        setCantidad((actual) =>
                          Math.max(1, actual - 1)
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center text-2xl font-medium text-gray-500"
                    >
                      −
                    </button>

                    <span className="text-xl font-bold text-[#174f3d]">
                      {cantidad}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setCantidad((actual) => actual + 1)
                      }
                      className="flex h-9 w-9 items-center justify-center text-2xl font-medium text-gray-500"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* AGREGAR PRODUCTO */}

              <button
                type="button"
                onClick={agregarProducto}
                disabled={!producto}
                className="mt-5 flex h-[58px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#c4932f] bg-white text-base font-bold text-[#174f3d] transition active:scale-[0.99] disabled:opacity-50"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#174f3d] text-lg">
                  +
                </span>

                Agregar producto
              </button>

              {/* PRODUCTOS AGREGADOS */}

              {items.length > 0 && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#e2ddd3]">

                  <div className="bg-[#f8f3e8] px-4 py-3">
                    <h2 className="font-bold text-[#174f3d]">
                      Productos agregados
                    </h2>
                  </div>

                  {items.map((item, index) => (
                    <div
                      key={`${item.producto}-${index}`}
                      className="flex items-center justify-between border-t border-[#eee9df] px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.producto}
                        </p>

                        <p className="text-sm text-gray-500">
                          Cantidad: {item.cantidad}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => eliminarProducto(index)}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-red-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* GUARDAR REPORTE */}

              <button
                type="button"
                onClick={guardarReporte}
                disabled={items.length === 0 || guardando}
                className="
                  mt-5
                  flex
                  h-[60px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-[#c4932f]
                  bg-[#174f3d]
                  text-lg
                  font-bold
                  text-white
                  transition
                  active:scale-[0.99]
                  disabled:cursor-not-allowed
                  disabled:bg-[#adc2ba]
                  disabled:text-white
                "
              >
                <span>▣</span>

                {guardando
                  ? "Guardando..."
                  : "Guardar reporte"}
              </button>
            </div>
          </section>
        )}

        {/* ================================================= */}
        {/* REPORTES */}
        {/* ================================================= */}

        {vista === "reportes" && (
          <section className="p-4 sm:p-5">

            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#174f3d]">
                Reportes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Historial de hoy y ayer
              </p>
            </div>

            {cargando ? (
              <div className="rounded-2xl border border-[#e2ddd3] bg-white p-6 text-center text-gray-500">
                Cargando reportes...
              </div>
            ) : reportes.length === 0 ? (
              <div className="rounded-2xl border border-[#e2ddd3] bg-white p-6 text-center text-gray-500">
                Aún no hay reportes de hoy o ayer.
              </div>
            ) : (
              <div className="space-y-4">

                {reportes.map((reporte, index) => (
                  <div
                    key={reporte.id ?? index}
                    className="overflow-hidden rounded-2xl border border-[#e2ddd3] bg-white shadow-sm"
                  >

                    {/* CABECERA REPORTE */}

                    <div className="bg-[#f8f3e8] px-4 py-3">

                      <div className="flex items-center justify-between gap-3">

                        <strong className="text-[#174f3d]">
                          {reporte.villa}
                        </strong>

                        <span className="text-sm text-gray-600">
                          {new Date(
                            reporte.fecha + "T00:00:00"
                          ).toLocaleDateString("es-CR")}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {reporte.colaborador}
                      </p>
                    </div>

                    {/* PRODUCTOS */}

                    <div>

                      <div className="grid grid-cols-[1fr_85px] border-b border-[#174f3d] px-4 py-2 text-sm font-bold text-[#174f3d]">
                        <span>Producto</span>

                        <span className="text-center">
                          Cantidad
                        </span>
                      </div>

                      {reporte.items.map(
                        (item, itemIndex) => (
                          <div
                            key={`${item.producto}-${itemIndex}`}
                            className="grid grid-cols-[1fr_85px] border-b border-[#eee9df] px-4 py-3 last:border-b-0"
                          >
                            <span>
                              {item.producto}
                            </span>

                            <span className="text-center font-bold">
                              {item.cantidad}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ================================================= */}
        {/* PIE */}
        {/* ================================================= */}

        <footer className="mt-2 bg-[#174f3d] px-5 py-7 text-center">

          <div className="mb-3 flex items-center justify-center gap-3">

            <div className="h-px w-12 bg-[#c4932f]" />

            <span className="text-[#c4932f]">
              ✦
            </span>

            <div className="h-px w-12 bg-[#c4932f]" />
          </div>

          <p className="font-serif text-base font-semibold italic text-[#f8f3e8]">
            Gracias por mantener nuestro estándar de excelencia.
          </p>
        </footer>
      </div>
    </main>
  );
}