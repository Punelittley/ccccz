import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { SiteContent } from "../../types";

const defaultContent: SiteContent = {
  hero: {
    title: "Книжный Клуб",
    subtitle: "Читаем вместе, обсуждаем с удовольствием",
    description: "Присоединяйтесь к сообществу любителей литературы",
    imageUrl: "https://images.unsplash.com/photo-1709855256067-12ad9a64ac06?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwYm9vayUyMGNsdWIlMjByZWFkaW5nfGVufDF8fHx8MTc3MjU1NjcxM3ww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  features: [
    {
      id: "1",
      title: "Разнообразие жанров",
      description: "От классики до современной литературы — каждый найдёт книгу по душе",
      icon: "BookOpen"
    },
    {
      id: "2",
      title: "Дружное сообщество",
      description: "Общайтесь с единомышленниками и делитесь впечатлениями",
      icon: "Users"
    },
    {
      id: "3",
      title: "Живые обсуждения",
      description: "Обсуждайте сюжет, персонажей и делитесь своими мыслями",
      icon: "MessageCircle"
    }
  ],
  gallery: [
    {
      id: "1",
      title: "Ваша личная библиотека",
      description: "Доступ к электронным версиям книг",
      imageUrl: "https://images.unsplash.com/photo-1763616828336-e7fcd02086f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rc2hlbGYlMjBsaWJyYXJ5JTIwaG9tZXxlbnwxfHx8fDE3NzI1NTY3MTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    {
      id: "2",
      title: "Читайте вместе с нами",
      description: "Еженедельные встречи и обсуждения",
      imageUrl: "https://images.unsplash.com/photo-1713942590283-59867d5e3f8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjByZWFkaW5nJTIwYm9va3MlMjB0b2dldGhlcnxlbnwxfHx8fDE3NzI1MjE0MDF8MA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  ],
  booksSection: {
    title: "Наши книги",
    description: "Выберите книгу и присоединяйтесь к обсуждению. Делитесь мнениями, задавайте вопросы и находите новых друзей!"
  },
  // footer: {
  //   text: "© 2026 Книжный Клуб. Читайте с удовольствием!"
  // }
};

export default function AdminContent() {
  const [content, setContent] = useState<SiteContent>(defaultContent);

  useEffect(() => {
    fetch("/api/content")
      .then(r => r.json())
      .then((data: SiteContent) => setContent(data))
      .catch(err => console.error("failed to load site content", err));
  }, []);

  const handleSave = () => {
    fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    })
      .then(() => toast.success("Контент успешно сохранён"))
      .catch(err => console.error("failed to save content", err));
  };

  const updateHero = (field: keyof SiteContent['hero'], value: string) => {
    setContent({
      ...content,
      hero: { ...content.hero, [field]: value }
    });
  };

  const updateFeature = (id: string, field: keyof SiteContent['features'][0], value: string) => {
    setContent({
      ...content,
      features: content.features.map(f =>
        f.id === id ? { ...f, [field]: value } : f
      )
    });
  };

  const updateGalleryItem = (id: string, field: keyof SiteContent['gallery'][0], value: string) => {
    setContent({
      ...content,
      gallery: content.gallery.map(g =>
        g.id === id ? { ...g, [field]: value } : g
      )
    });
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Управление контентом</h1>
          <Button onClick={handleSave}>
            Сохранить изменения
          </Button>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList>
            <TabsTrigger value="hero">Наполнение</TabsTrigger>
            <TabsTrigger value="features">Особенности</TabsTrigger>
            <TabsTrigger value="gallery">Галерея</TabsTrigger>
            <TabsTrigger value="books">Секция книг</TabsTrigger>
            {/* <TabsTrigger value="footer">Футер</TabsTrigger> */}
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Редактировать наполнение</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero-title">Заголовок</Label>
                  <Input
                    id="hero-title"
                    value={content.hero.title}
                    onChange={(e) => updateHero("title", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-subtitle">Подзаголовок</Label>
                  <Input
                    id="hero-subtitle"
                    value={content.hero.subtitle}
                    onChange={(e) => updateHero("subtitle", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-description">Описание</Label>
                  <Textarea
                    id="hero-description"
                    value={content.hero.description}
                    onChange={(e) => updateHero("description", e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="hero-image">URL изображения</Label>
                  <Input
                    id="hero-image"
                    value={content.hero.imageUrl}
                    onChange={(e) => updateHero("imageUrl", e.target.value)}
                  />
                </div>
                {content.hero.imageUrl && (
                  <div className="mt-4">
                    <Label>Предпросмотр</Label>
                    <img
                      src={content.hero.imageUrl}
                      alt="Hero preview"
                      className="w-full h-48 object-cover rounded-lg mt-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Section */}
          <TabsContent value="features">
            <div className="space-y-4">
              {content.features.map((feature, index) => (
                <Card key={feature.id}>
                  <CardHeader>
                    <CardTitle>Особенность {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`feature-title-${feature.id}`}>Заголовок</Label>
                      <Input
                        id={`feature-title-${feature.id}`}
                        value={feature.title}
                        onChange={(e) => updateFeature(feature.id, "title", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`feature-desc-${feature.id}`}>Описание</Label>
                      <Textarea
                        id={`feature-desc-${feature.id}`}
                        value={feature.description}
                        onChange={(e) => updateFeature(feature.id, "description", e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`feature-icon-${feature.id}`}>Иконка (lucide-react)</Label>
                      <Input
                        id={`feature-icon-${feature.id}`}
                        value={feature.icon}
                        onChange={(e) => updateFeature(feature.id, "icon", e.target.value)}
                        placeholder="BookOpen, Users, MessageCircle"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gallery Section */}
          <TabsContent value="gallery">
            <div className="space-y-4">
              {content.gallery.map((item, index) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>Элемент галереи {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`gallery-title-${item.id}`}>Заголовок</Label>
                      <Input
                        id={`gallery-title-${item.id}`}
                        value={item.title}
                        onChange={(e) => updateGalleryItem(item.id, "title", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`gallery-desc-${item.id}`}>Описание</Label>
                      <Textarea
                        id={`gallery-desc-${item.id}`}
                        value={item.description}
                        onChange={(e) => updateGalleryItem(item.id, "description", e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`gallery-image-${item.id}`}>URL изображения</Label>
                      <Input
                        id={`gallery-image-${item.id}`}
                        value={item.imageUrl}
                        onChange={(e) => updateGalleryItem(item.id, "imageUrl", e.target.value)}
                      />
                    </div>
                    {item.imageUrl && (
                      <div className="mt-4">
                        <Label>Предпросмотр</Label>
                        <img
                          src={item.imageUrl}
                          alt="Gallery preview"
                          className="w-full h-48 object-cover rounded-lg mt-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Books Section */}
          <TabsContent value="books">
            <Card>
              <CardHeader>
                <CardTitle>Секция "Наши книги"</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="books-title">Заголовок</Label>
                  <Input
                    id="books-title"
                    value={content.booksSection.title}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        booksSection: { ...content.booksSection, title: e.target.value }
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="books-description">Описание</Label>
                  <Textarea
                    id="books-description"
                    value={content.booksSection.description}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        booksSection: { ...content.booksSection, description: e.target.value }
                      })
                    }
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer Section */}
          {/* <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Футер</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="footer-text">Текст футера</Label>
                  <Input
                    id="footer-text"
                    value={content.footer.text}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        footer: { text: e.target.value }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}
        </Tabs>
      </div>
    </AdminLayout>
  );
}
