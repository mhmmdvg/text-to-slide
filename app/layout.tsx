import { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Text to slide',
	description: 'Text to slide by mvigi',
	openGraph: {
		title: 'Text to slide',
		description: 'Text to slide by mvigi',
		siteName: 'MVigi',
		locale: 'en-US',
		type: 'website',
	},

	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				{/* <main className="flex h-screen w-screen flex-col items-center justify-center space-y-5 bg-white text-black"> */}
				{children}
				{/* </main> */}
			</body>
		</html>
	);
}
