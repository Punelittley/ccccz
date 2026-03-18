import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalComments: 0,
    totalQuotes: 0
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch((err) => {
        console.error("failed to load stats", err);
      });
  }, []);

  const statCards = [
    { title: "Всего книг", value: stats.totalBooks },
    { title: "Пользователей", value: stats.totalUsers },
    { title: "Комментариев", value: stats.totalComments },
    { title: "Цитат", value: stats.totalQuotes }
  ];

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-8">Панель управления</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            return (
              <Card key={stat.title} className="ui-card-content1">
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-small text-sm font-medium text-muted">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Добро пожаловать в админ-панель!</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <p className="text-muted">
              Здесь вы можете управлять всеми аспектами сайта книжного клуба:
            </p> */}

            {/* <ul className="mt-4 space-y-2 text-muted">
              <li>Добавлять, редактировать и удалять книги</li>
              <li>Управлять учётными записями пользователей</li>
              <li>Редактировать контент главной страницы</li>
              <li>Просматривать статистику активности</li>
            </ul> */}
            <img src="/cat.jpg" alt="" className="cat" />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
