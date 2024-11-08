'use client'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SidebarLayout } from '@/app/(authenticated)/components/sidebar-layout';
import { Sidebar, SidebarHeader, SidebarBody, SidebarSection, SidebarItem, SidebarLabel, SidebarSpacer } from '@/app/(authenticated)/components/sidebar';
import {
  HomeIcon,
  SparklesIcon,
  Square2StackIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/20/solid';

export function ApplicationLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

 
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push('/signin');
    }
  };

  if (isLoading) {
    // Możesz tu dodać spinner lub inny wskaźnik ładowania
    return null;
  }

  return (
    <>
      {user ? (
        <SidebarLayout
          sidebar={
            <Sidebar>
              <SidebarHeader>
                <img src="/vercel.svg" className='invert h-6 w-auto' />
              </SidebarHeader>

              <SidebarBody>
                <SidebarSection>
                  <SidebarItem href="/" >
                    <HomeIcon />
                    <SidebarLabel>Strona główna</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/models" >
                    <SparklesIcon />
                    <SidebarLabel>Modele</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/twojemodele">
                    <SparklesIcon />
                    <SidebarLabel>Twoje własne modele</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/train" >
                    <Square2StackIcon />
                    <SidebarLabel>Trenuj model</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>

                <SidebarSpacer />

                <SidebarSection>
                  <SidebarItem href="/account" >
                    <UserCircleIcon />
                    <SidebarLabel>Moje konto</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/" onClick={handleSignOut}>
                    <ArrowRightStartOnRectangleIcon />
                    <SidebarLabel>
                      Wyloguj
                    </SidebarLabel>
                  </SidebarItem>
                </SidebarSection>
              </SidebarBody>
            </Sidebar>
          }
        >
          {children}
        </SidebarLayout>
      ) : (
        <>
          {/* Zawartość dla niezalogowanych użytkowników */}
          {children}
        </>
      )}
    </>
  );
}
