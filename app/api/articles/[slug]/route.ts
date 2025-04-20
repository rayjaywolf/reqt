import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        // Properly handle the async params
        const { slug } = params;
        const decodedSlug = decodeURIComponent(slug);

        // Define the path to the article MDX file
        const articlePath = path.join(process.cwd(), 'content', 'articles', `${decodedSlug}.mdx`);

        // Check if the file exists
        if (!fs.existsSync(articlePath)) {
            return NextResponse.json(
                { error: 'Article not found' },
                { status: 404 }
            );
        }

        // Read the file content
        const fileContent = fs.readFileSync(articlePath, 'utf8');

        // Parse the frontmatter
        const { data, content } = matter(fileContent);

        // Serialize the MDX content
        const mdxSource = await serialize(content);

        // Return the article data
        return NextResponse.json({
            title: data.title,
            date: data.date,
            author: data.author,
            bannerImage: data.bannerImage,
            thumbnailImage: data.thumbnailImage,
            category: data.category,
            excerpt: data.excerpt,
            content: mdxSource
        });
    } catch (error) {
        console.error('Error fetching article:', error);
        return NextResponse.json(
            { error: 'Failed to fetch article' },
            { status: 500 }
        );
    }
} 