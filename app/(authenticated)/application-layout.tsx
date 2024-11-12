'use client'
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SidebarLayout } from '@/app/(authenticated)/components/sidebar-layout';
import { Sidebar, SidebarHeader, SidebarBody, SidebarSection, SidebarItem, SidebarLabel, SidebarSpacer, SidebarFooter } from '@/app/(authenticated)/components/sidebar';
import {
  SparklesIcon,
  CameraIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  RocketLaunchIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { Logo } from '@/app/components/ui/logo';

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
    return null;
  }

  return (
    <>
      <SidebarLayout
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <Logo className='pl-4' />
            </SidebarHeader>

            <SidebarBody>
              <p className="px-4 mb-6">Wymarz coś pięknego</p>
              
              <SidebarSection className='pl-4'>
                <SidebarItem href="/models">
                  <SparklesIcon className="w-5 h-5" />
                  <SidebarLabel>Modele</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/twojemodele">
                  <CameraIcon className="w-5 h-5" />
                  <SidebarLabel>Twoje modele</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/galeria">
                  <PhotoIcon className="w-5 h-5" />
                  <SidebarLabel>Galeria</SidebarLabel>
                </SidebarItem>
                <SidebarItem href="/train">
                  <RocketLaunchIcon className="w-5 h-5" />
                  <SidebarLabel>Trenuj model</SidebarLabel>
                </SidebarItem>
              </SidebarSection>

              <SidebarSpacer />

              <div className="px-4 py-3 mx-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Twoje tokeny :</p>
               
               
              </div>

              <SidebarFooter>
                <SidebarSection className='pl-4'>
                  <SidebarItem href="/account">
                    <UserCircleIcon className="w-5 h-5" />
                    <SidebarLabel>Moje konto</SidebarLabel>
                  </SidebarItem>
                  <SidebarItem href="/" onClick={handleSignOut}>
                    <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                    <SidebarLabel>Wyloguj</SidebarLabel>
                  </SidebarItem>
                </SidebarSection>
              </SidebarFooter>
            </SidebarBody>
          </Sidebar>
        }
      >
        {children}
      </SidebarLayout>
    </>
  );
}
