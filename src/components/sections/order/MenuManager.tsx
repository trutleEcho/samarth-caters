"use client";

import React, {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import {Menu} from "@/data/entities/menu";
import {toast} from "sonner";
import {useTranslations} from "next-intl";

interface MenuManagerProps {
    eventId: string;
    menu?: Menu;
    onSave: () => void;
    isEditing?: boolean;
}

export default function MenuManager({eventId, menu, onSave, isEditing}: MenuManagerProps) {
    const t = useTranslations('menu');
    const [items, setItems] = useState<string>();

    const handleSave = async () => {
        try {
            if (menu) {
                const updatedMenu = {
                    ...menu,
                    items: items || "",
                };

                const response = await fetch(`/api/menu`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedMenu),
                });

                if (!response.ok) {
                    toast.error('Error updating menu');
                    return
                }
            } else {
                const newMenu = {
                    event_id: eventId,
                    items: items || "",
                    created_at: new Date().toISOString(),
                };
                const response = await fetch(`/api/menu`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newMenu),
                });

                if (!response.ok) {
                    toast.error('Error creating menu');
                    return
                }
            }
            toast.success(t('menuUpdated'));
            onSave()
        } catch (error) {
            toast.error(t('errors.updateFailed'));
            console.error('unexpected error', error);
        }
    };

    useEffect(() => {
        if (menu) {
            setItems(menu.items);
        }
    }, [menu]);

    return (
        <div className="mt-4">
            <span className="text-muted-foreground text-xs">Menu Items</span>
            <Textarea
                id="menu-items"
                className="mt-1 font-mono dark:text-white"
                placeholder={menu?.items ? menu.items : isEditing ? "Enter menu items" : "No menu items"}
                value={items}
                onChange={e => setItems(e.target.value)}
                rows={6}
                disabled={!isEditing}
            />
            {isEditing && (
                <div className="flex justify-end mt-2">
                    <Button onClick={handleSave}>Update Menu</Button>
                </div>)}
        </div>
    );
}