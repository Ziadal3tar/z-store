import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface BlogPost {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  readTime: string;
  date: string;
  featured?: boolean;
}

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css'],
})
export class BlogComponent {
  readonly categories = ['All', 'Style', 'Shopping', 'Guides', 'Stories'];
  activeCategory = 'All';

  readonly posts: BlogPost[] = [
    {
      id: 'build-a-better-wardrobe',
      category: 'Style',
      title: 'Build a better wardrobe without buying more',
      excerpt: 'A practical approach to choosing versatile pieces that work harder together.',
      image: 'assets/blog-1.avif',
      readTime: '5 min read',
      date: 'Sep 18, 2026',
      featured: true,
    },
    {
      id: 'online-shopping-guide',
      category: 'Shopping',
      title: 'A smarter way to shop online',
      excerpt: 'Simple checks that help you compare products before you add them to your cart.',
      image: 'assets/blog-2.avif',
      readTime: '4 min read',
      date: 'Sep 12, 2026',
    },
    {
      id: 'choose-the-right-product',
      category: 'Guides',
      title: 'How to choose the right product',
      excerpt: 'From specifications to everyday use, here is what deserves your attention.',
      image: 'assets/blog-3.webp',
      readTime: '6 min read',
      date: 'Sep 07, 2026',
    },
    {
      id: 'small-details',
      category: 'Stories',
      title: 'Why small details change the experience',
      excerpt: 'Good shopping is often about the little things that remove friction.',
      image: 'assets/blog-4.avif',
      readTime: '3 min read',
      date: 'Aug 30, 2026',
    },
    {
      id: 'shopping-with-purpose',
      category: 'Shopping',
      title: 'Shopping with a little more purpose',
      excerpt: 'Questions worth asking before choosing the next thing you bring home.',
      image: 'assets/blog-5.avif',
      readTime: '5 min read',
      date: 'Aug 24, 2026',
    },
    {
      id: 'from-discovery-to-delivery',
      category: 'Guides',
      title: 'From discovery to delivery',
      excerpt: 'A closer look at creating a smoother journey from product page to doorstep.',
      image: 'assets/blog-6.avif',
      readTime: '4 min read',
      date: 'Aug 16, 2026',
    },
  ];

  constructor(private readonly router: Router) {}

  get featuredPost(): BlogPost {
    return this.posts.find(post => post.featured) || this.posts[0];
  }

  get filteredPosts(): BlogPost[] {
    return this.posts.filter(post =>
      this.activeCategory === 'All' || post.category === this.activeCategory
    );
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
  }

  openPost(post: BlogPost): void {
    this.router.navigate(['/blog'], { queryParams: { post: post.id } });
  }

  shopNow(): void {
    this.router.navigate(['/shop']);
  }
}
