import React, { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuItem,
  NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import CategorySettings from "./settings_submenus/category_submenu"; // Import the category settings component

// Define the components for each submenu
const ProfileSettings = () => <div className='p-4'>Profile Settings Content</div>;
const SecuritySettings = () => <div className='p-4'>Security Settings Content</div>;
const NotificationSettings = () => <div className='p-4'>Notification Settings Content</div>;

// Define the submenus
const submenus = [
  {
    name: "Profile",
    component: <ProfileSettings />,
  },
  {
    name: "Categories",
    component: <CategorySettings />,
  },
  {
    name: "Security",
    component: <SecuritySettings />,
  },
  {
    name: "Notifications",
    component: <NotificationSettings />,
  },
];

export default function SettingsPage() {
  // State to keep track of the selected submenu
  const [selectedSubmenu, setSelectedSubmenu] = useState(submenus[0]);

  return (
    <div className='flex gap-2 -mt-5'>
      <div className='flex-1 bg-primary h-screen max-w-72 -ml-4 rounded-lg shadow-lg'>
        <p className='flex justify-center text-white text-3xl font-bold mt-3 font-settings'>Settings</p>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className='py-2'>
              {submenus.map((submenu) => (
                <NavigationMenuLink
                  key={submenu.name}
                  onClick={() => setSelectedSubmenu(submenu)}
                  className='text-white font-setting font-semibold text-xl px-4 py-2 hover:bg-primary-dark block transition duration-300 ease-in-out'>
                  {submenu.name}
                </NavigationMenuLink>
              ))}
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className='flex-1 mx-auto p-4 bg-gray-100 rounded-lg shadow-lg'>{selectedSubmenu.component}</div>
    </div>
  );
}
