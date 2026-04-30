// Esta ruta ya esta protegida por el middleware transversal creado anteriormente.
export default function DashboardPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
            <p className="text-gray-600 mt-4">Bienvenido al sistema. Su sesión ha sido validada.</p>
        </div>
    );
}