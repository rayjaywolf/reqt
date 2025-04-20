import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export async function GET(request: NextRequest) {
    try {
        // Define the path to the articles directory
        const articlesDirectory = path.join(process.cwd(), 'content', 'articles');

        // Check if the directory exists
        if (!fs.existsSync(articlesDirectory)) {
            return NextResponse.json({ articles: [] });
        }

        // Get all MDX files in the directory
        const fileNames = fs.readdirSync(articlesDirectory)
            .filter(fileName => fileName.endsWith('.mdx'));

        // Parse each file and extract the frontmatter
        const articles = fileNames.map(fileName => {
            const slug = fileName.replace(/\.mdx$/, '');
            const fullPath = path.join(articlesDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(fileContents);

            return {
                slug,
                title: data.title,
                date: data.date,
                author: data.author,
                thumbnailImage: data.thumbnailImage,
                category: data.category,
                excerpt: data.excerpt
            };
        });

        // Sort articles by date (newest first)
        articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({ articles });
    } catch (error) {
        console.error('Error fetching articles:', error);
        return NextResponse.json(
            { error: 'Failed to fetch articles' },
            { status: 500 }
        );
    }
} 